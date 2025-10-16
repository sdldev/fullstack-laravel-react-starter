<?php

namespace App\Providers;

use App\Models\SettingApp;
use App\Observers\GlobalActivityLogger;
use App\Observers\SettingAppObserver;
use App\Services\SecurityLogService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind SecurityLogService as singleton
        $this->app->singleton(SecurityLogService::class, function ($app) {
            return new SecurityLogService;
        });

        // Bind ImageService as singleton
        $this->app->singleton(\App\Services\ImageService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        Gate::define('admin', function ($user) {
            return auth()->check() && auth()->user()->role === 'admin';
        });
        // Share application settings globally with Inertia
        Inertia::share('setting', function () {
            $setting = SettingApp::first();

            return [
                'nama_app' => $setting?->nama_app,
                'description' => $setting?->description,
                'address' => $setting?->address,
                'email' => $setting?->email,
                'phone' => $setting?->phone,
                'facebook' => $setting?->facebook,
                'instagram' => $setting?->instagram,
                'tiktok' => $setting?->tiktok,
                'youtube' => $setting?->youtube,
                'image' => $setting?->image,
            ];
        });

        // SettingApp Observers
        SettingApp::observe(GlobalActivityLogger::class);
        SettingApp::observe(SettingAppObserver::class);

    }
}
