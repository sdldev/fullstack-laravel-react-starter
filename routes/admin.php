<?php

use App\Http\Controllers\Admin\ApiTokenController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\Admin\SettingAppController;
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
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    // User management routes
    Route::resource('admin/users', UserController::class)->except(['create', 'show', 'edit'])->names('admin.users');

    // Application Settings
    Route::get('/admin/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/admin/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');

    // Audit and Security Logs
    Route::get('/admin/audit-logs', [LogController::class, 'audit'])->name('audit-logs.index');
    Route::get('/admin/security-logs', [LogController::class, 'security'])->name('security-logs.index');
    Route::get('/admin/security-logs/archive/{archiveFilename}', [LogController::class, 'archiveShow'])->name('security-logs.archive');
    Route::post('/admin/security-logs/archive-now', [LogController::class, 'archiveNow'])->name('security-logs.archive-now');
    Route::get('/admin/security-logs/download/{archiveFilename}', [LogController::class, 'downloadArchive'])->name('security-logs.download');

    // API Token Management
    Route::get('/admin/api-tokens', [ApiTokenController::class, 'index'])->name('admin.api-tokens.index');
    Route::post('/admin/api-tokens', [ApiTokenController::class, 'store'])->name('admin.api-tokens.store');
    Route::delete('/admin/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('admin.api-tokens.destroy');
});
