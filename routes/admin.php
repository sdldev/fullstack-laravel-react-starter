<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Here is where you can register admin routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group and require authentication.
|
*/

Route::middleware(['auth', 'verified', 'can:admin'])->group(function () {
    Route::get('/admin', [DashboardController::class, 'index'])->name('admin.dashboard');

    // User management routes
    Route::resource('admin/users', UserController::class)->names('admin.users');
});
