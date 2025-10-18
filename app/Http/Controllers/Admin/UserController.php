<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Users\StoreUserRequest;
use App\Http\Requests\Admin\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 10);
        $page = (int) $request->get('page', 1);

        // Cache key with pagination params for unique caching per page
        $cacheKey = "users_list_page_{$page}_per_{$perPage}";

        // Cache for 5 minutes (300 seconds) to reduce database load
        $users = Cache::remember($cacheKey, 300, function () use ($perPage) {
            return User::select([
                'id',
                'name',
                'email',
                'role',
                'member_number',
                'full_name',
                'phone',
                'join_date',
                'is_active',
                'created_at',
                // Exclude: password, address, note, image, updated_at, etc.
            ])
                ->latest('created_at')
                ->paginate($perPage);
        });

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => '/admin'],
                ['title' => 'Users', 'href' => '/admin/users'],
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $data['is_active'] = $data['is_active'] ?? true; // Auto-approve by default

        // Handle image upload with WebP conversion
        // User avatars: 200x200px, stored in 'users' folder
        if ($request->hasFile('image')) {
            try {
                $data['image'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('image'),
                    storagePath: 'users',
                    width: 200,
                    height: 200,
                    prefix: 'avatar',
                    quality: 85
                );
            } catch (\Exception $e) {
                return back()->withErrors(['image' => $e->getMessage()]);
            }
        }

        User::create($data);

        // Clear all users cache to show fresh data
        Cache::flush();

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        // Only hash password if it's provided
        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle image upload with WebP conversion
        // User avatars: 200x200px, stored in 'users' folder
        if ($request->hasFile('image')) {
            try {
                if ($user->image) {
                    $this->imageService->deleteImageFile($user->image);
                }

                $data['image'] = $this->imageService->processImageWithDimensions(
                    file: $request->file('image'),
                    storagePath: 'users',
                    width: 200,
                    height: 200,
                    prefix: 'avatar',
                    quality: 85
                );
            } catch (\Exception $e) {
                return back()->withErrors(['image' => $e->getMessage()]);
            }
        }

        $user->update($data);

        // Clear cache to reflect updated data
        Cache::flush();

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        // Delete avatar image
        if ($user->image) {
            $this->imageService->deleteImageFile($user->image);
        }

        $user->delete();

        // Clear cache to reflect deletion
        Cache::flush();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
