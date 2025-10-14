<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can view users index', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get('/admin/users');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/Index')
        ->has('users')
    );
});

test('non-admin cannot view users index', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($user)->get('/admin/users');

    $response->assertStatus(403);
});

test('admin can create user', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001',
        'full_name' => 'Test User Full',
        'address' => '123 Test Street',
        'phone' => '+1234567890',
        'join_date' => '2024-01-01',
        'note' => 'Test note',
        'is_active' => true,
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertRedirect('/admin/users');
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'role' => 'user',
        'member_number' => 'MEM001',
        'is_active' => true,
    ]);
});

test('user is auto-approved when created', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
    ];

    $this->actingAs($admin)->post('/admin/users', $userData);

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'is_active' => true,
    ]);
});

test('admin can update user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create([
        'role' => 'user',
        'member_number' => 'OLD001',
    ]);

    $updateData = [
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        'role' => 'admin',
        'member_number' => 'NEW001',
        'full_name' => 'Updated Full Name',
        'is_active' => false,
    ];

    $response = $this->actingAs($admin)->put("/admin/users/{$user->id}", $updateData);

    $response->assertRedirect('/admin/users');
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => 'updated@example.com',
        'role' => 'admin',
        'member_number' => 'NEW001',
        'is_active' => false,
    ]);
});

test('admin can delete user', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->delete("/admin/users/{$user->id}");

    $response->assertRedirect('/admin/users');
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('validation fails for duplicate email', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $existingUser = User::factory()->create(['email' => 'existing@example.com']);

    $userData = [
        'name' => 'Test User',
        'email' => 'existing@example.com', // Duplicate email
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('email');
});

test('validation fails for duplicate member number', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $existingUser = User::factory()->create(['member_number' => 'MEM001']);

    $userData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'user',
        'member_number' => 'MEM001', // Duplicate member number
    ];

    $response = $this->actingAs($admin)->post('/admin/users', $userData);

    $response->assertSessionHasErrors('member_number');
});
