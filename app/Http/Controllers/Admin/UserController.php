<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(private ImageUploadService $imageService) {}

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $users = User::paginate($perPage);

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/admin'],
                ['title' => 'Users', 'href' => '/admin/users'],
            ],
        ]);
    }

    public function store(\App\Http\Requests\Admin\StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $data['is_active'] = $data['is_active'] ?? true; // Auto-approve by default

        // Handle image upload with security
        if ($request->hasFile('image')) {
            try {
                $data['image'] = $this->imageService->uploadSecure(
                    $request->file('image'),
                    'users',
                    1000
                );
            } catch (\Exception $e) {
                return back()->withErrors(['image' => $e->getMessage()]);
            }
        }

        User::create($data);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function update(\App\Http\Requests\Admin\UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        // Only hash password if it's provided
        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle image upload with security
        if ($request->hasFile('image')) {
            try {
                if ($user->image) {
                    $this->imageService->deleteSecure($user->image, 'users');
                }

                $data['image'] = $this->imageService->uploadSecure(
                    $request->file('image'),
                    'users',
                    1000
                );
            } catch (\Exception $e) {
                return back()->withErrors(['image' => $e->getMessage()]);
            }
        }

        $user->update($data);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        // Delete image securely
        if ($user->image) {
            $this->imageService->deleteSecure($user->image, 'users');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
