<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreApiTokenRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Sanctum\PersonalAccessToken;

class ApiTokenController extends Controller
{
    /**
     * Display a listing of the API tokens.
     */
    public function index(Request $request): \Inertia\Response
    {
        $tokens = $request->user()->tokens()
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/api-tokens/Index', [
            'tokens' => $tokens,
            'breadcrumbs' => [['title' => 'API Tokens', 'href' => '/admin/api-tokens']],
        ]);
    }

    /**
     * Store a newly created API token.
     */
    public function store(StoreApiTokenRequest $request): \Illuminate\Http\RedirectResponse
    {
        // Validation is handled by StoreApiTokenRequest

        $tokenResult = $request->user()->createToken(
            $request->name,
            $request->abilities
        );

        // Try to locate the created PersonalAccessToken record so we can return its id in the flash
        $createdPat = PersonalAccessToken::where('tokenable_type', get_class($request->user()))
            ->where('tokenable_id', $request->user()->getKey())
            ->where('name', $request->name)
            ->orderBy('created_at', 'desc')
            ->first();

        // If an expires_at was provided, parse it and save on the token record
        if ($request->filled('expires_at')) {
            try {
                // Accept both 'YYYY-MM-DDTHH:MM' from datetime-local and other ISO-like inputs
                $expires = Carbon::parse($request->expires_at);

                // Find the most recent token for this user with the given name
                $pat = PersonalAccessToken::where('tokenable_type', get_class($request->user()))
                    ->where('tokenable_id', $request->user()->getKey())
                    ->where('name', $request->name)
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($pat) {
                    $pat->expires_at = $expires;
                    $pat->save();
                    // Ensure createdPat references this record
                    $createdPat = $pat;
                }
            } catch (\Exception $e) {
                // Log and continue — don't expose parsing errors to user
                report($e);
            }
        }

        $redirect = back()->with('success', 'API token created successfully. Copy the token now - it will not be shown again')
            ->with('token', $tokenResult->plainTextToken);

        if ($createdPat) {
            $redirect = $redirect->with('token_id', $createdPat->getKey());
        }

        return $redirect;
    }

    /**
     * Remove the specified API token.
     */
    public function destroy(Request $request, PersonalAccessToken $token): \Illuminate\Http\RedirectResponse
    {
        // Ensure the token belongs to the authenticated user
        if ($token->tokenable_id !== $request->user()->id) {
            return back()->withErrors(['message' => 'Unauthorized.']);
        }

        $token->delete();

        return back()->with('success', 'API token deleted successfully.');
    }
}
