<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
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

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('users', 'public');
        }

        User::create($data);

        return redirect()->route('admin.users.index');
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

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($user->image && \Storage::disk('public')->exists($user->image)) {
                \Storage::disk('public')->delete($user->image);
            }
            $data['image'] = $request->file('image')->store('users', 'public');
        }

        $user->update($data);

        return redirect()->route('admin.users.index');
    }

    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        // Delete image if exists
        if ($user->image && \Storage::disk('public')->exists($user->image)) {
            \Storage::disk('public')->delete($user->image);
        }

        $user->delete();

        return redirect()->route('admin.users.index');
    }
}
