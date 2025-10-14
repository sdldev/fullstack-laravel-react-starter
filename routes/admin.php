<?php

use App\Http\Controllers\Admin\DashboardController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Example admin resource routes would go here
    // Route::resource('admin/users', Admin\UserController::class)->names('admin.users');
    // Route::resource('admin/settings', Admin\SettingController::class)->names('admin.settings');
});