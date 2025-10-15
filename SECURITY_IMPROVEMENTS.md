# Panduan Implementasi Security Improvements

Dokumen ini berisi panduan langkah-demi-langkah untuk mengimplementasikan security improvements yang direkomendasikan dalam `SECURITY_ANALYSIS.md`.

---

## 1. Fix Critical Issues

### 1.1 Hapus Default Weak Passwords

**File**: `database/seeders/UserSeeder.php`

**Before (UNSAFE)**:
```php
User::create([
    'email' => 'admin@admin.com',
    'password' => Hash::make('password'),
    // ...
]);
```

**After (SAFE)**:
```php
User::create([
    'email' => 'admin@admin.com',
    'password' => Hash::make(env('ADMIN_DEFAULT_PASSWORD')), // No fallback, must be set
    'must_change_password' => true, // Force password reset on first login
]);
**Additional**: Add forced password reset untuk first login:
```php
// Add to users table migration
$table->timestamp('password_changed_at')->nullable();
$table->boolean('must_change_password')->default(false);
```

---

### 1.2 Filter Sensitive Data dari Inertia Props

**File**: `app/Http/Middleware/HandleInertiaRequests.php`

**Before (UNSAFE)**:
```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(), // Exposes everything!
        ],
    ];
}
```

**After (SAFE)**:
```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'full_name' => $request->user()->full_name,
                'image' => $request->user()->image,
                'is_active' => $request->user()->is_active,
                'has_two_factor' => !is_null($request->user()->two_factor_secret),
                // NEVER expose: password, two_factor_secret, recovery_codes, remember_token
            ] : null,
        ],
    ];
}
```

**Create User Resource** (Better approach):
```php
// app/Http/Resources/UserResource.php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'full_name' => $this->full_name,
            'image' => $this->image,
            'is_active' => $this->is_active,
            'has_two_factor' => !is_null($this->two_factor_secret),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
```

Then use in middleware:
```php
use App\Http\Resources\UserResource;

'auth' => [
    'user' => $request->user() ? UserResource::make($request->user()) : null,
],
```

---

## 2. Fix High Priority Issues

### 2.1 Proper File Upload Validation

**File**: `app/Http/Controllers/Admin/UserController.php`

**Create Service**: `app/Services/ImageUploadService.php`
```php
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class ImageUploadService
{
    /**
     * Upload and validate image with security measures
     *
     * @param UploadedFile $file
     * @param string $directory
     * @param int $maxWidth
     * @return string Path to uploaded file
     * @throws \Exception
     */
    public function uploadSecure(
        UploadedFile $file,
        string $directory = 'uploads',
        int $maxWidth = 1000
    ): string {
        // 1. Validate MIME type
        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception('Invalid file type');
        }

        // 2. Validate file size (max 2MB)
        if ($file->getSize() > 2048 * 1024) {
            throw new \Exception('File too large');
        }

        // 3. Validate actual image content by reading it
        try {
            $image = Image::read($file->path());
        } catch (\Exception $e) {
            throw new \Exception('Invalid image file');
        }

        // 4. Re-encode image untuk strip metadata & potential malware
        // Resize untuk prevent decompression bombs
        if ($image->width() > $maxWidth) {
            $image->scale(width: $maxWidth);
        }

        // 5. Generate secure filename
        $filename = Str::random(40) . '.jpg';
        $path = $directory . '/' . $filename;

        // 6. Save dengan format yang diketahui aman (JPEG)
        $encoded = $image->encodeByMediaType('image/jpeg', quality: 85);
        Storage::disk('public')->put($path, $encoded);

        return $path;
    }

    /**
     * Delete file dengan path validation
     *
     * @param string|null $path
     * @param string $allowedDirectory
     * @return bool
     */
    public function deleteSecure(?string $path, string $allowedDirectory = 'uploads'): bool
    {
        if (!$path) {
            return false;
        }

        // Validate path tidak keluar dari allowed directory
        if (!str_starts_with($path, $allowedDirectory . '/')) {
            return false;
        }

        // Check file exists
        if (!Storage::disk('public')->exists($path)) {
            return false;
        }

        // Delete file
        return Storage::disk('public')->delete($path);
    }
}
```

**Update Controller**:
```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private ImageUploadService $imageService
    ) {}

    public function store(\App\Http\Requests\Admin\StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $data['is_active'] = $data['is_active'] ?? true;

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

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function update(\App\Http\Requests\Admin\UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (!empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle image upload with security
        if ($request->hasFile('image')) {
            try {
                // Delete old image securely
                if ($user->image) {
                    $this->imageService->deleteSecure($user->image, 'users');
                }

                // Upload new image
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

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            abort(403, 'You cannot delete your own account.');
        }

        // Delete image securely
        if ($user->image) {
            $this->imageService->deleteSecure($user->image, 'users');
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
```

---

### 2.2 HTTPS Enforcement

**File**: `app/Providers/AppServiceProvider.php`

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Force HTTPS in production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        Gate::define('admin', function ($user) {
            return $user->role === 'admin';
        });
    }
}
```

**Update Environment**:
```env
# .env.production
APP_URL=https://yourdomain.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

---

### 2.3 Security Headers Middleware

**Create**: `app/Http/Middleware/SecurityHeaders.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // XSS Protection (legacy, tapi masih berguna untuk old browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // HSTS (only in production with HTTPS)
        if (app()->environment('production')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        return $response;
    }
}
```

**Register Middleware**: `bootstrap/app.php`

```php
<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class, // Add security headers
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

---

### 2.4 Security Logging

**Create**: `app/Services/SecurityLogger.php`

```php
<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecurityLogger
{
    /**
     * Log failed login attempt
     */
    public function logFailedLogin(string $email, Request $request): void
    {
        Log::channel('security')->warning('Failed login attempt', [
            'email' => $email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Log successful login
     */
    public function logSuccessfulLogin($user, Request $request): void
    {
        Log::channel('security')->info('Successful login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Log account lockout
     */
    public function logAccountLockout(string $email, Request $request): void
    {
        Log::channel('security')->alert('Account locked due to too many attempts', [
            'email' => $email,
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Log unauthorized access attempt
     */
    public function logUnauthorizedAccess($user, string $action, Request $request): void
    {
        Log::channel('security')->warning('Unauthorized access attempt', [
            'user_id' => $user?->id,
            'action' => $action,
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Log privilege escalation attempt
     */
    public function logPrivilegeEscalation($user, string $attemptedRole, Request $request): void
    {
        Log::channel('security')->critical('Privilege escalation attempt', [
            'user_id' => $user->id,
            'current_role' => $user->role,
            'attempted_role' => $attemptedRole,
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Log sensitive data access
     */
    public function logSensitiveDataAccess($user, string $dataType, $recordId): void
    {
        Log::channel('security')->info('Sensitive data accessed', [
            'user_id' => $user->id,
            'data_type' => $dataType,
            'record_id' => $recordId,
            'timestamp' => now(),
        ]);
    }
}
```

**Configure Logging**: `config/logging.php`

Add security channel:
```php
'channels' => [
    // ... existing channels

    'security' => [
        'driver' => 'daily',
        'path' => storage_path('logs/security.log'),
        'level' => env('LOG_LEVEL', 'info'),
        'days' => 90, // Keep security logs for 90 days
    ],
],
```

**Usage in LoginRequest**:
```php
<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Services\SecurityLogger;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function __construct(private SecurityLogger $securityLogger)
    {
        parent::__construct();
    }

    // ... existing methods

    public function validateCredentials(): User
    {
        $this->ensureIsNotRateLimited();

        /** @var User|null $user */
        $user = Auth::getProvider()->retrieveByCredentials($this->only('email', 'password'));

        if (! $user || ! Auth::getProvider()->validateCredentials($user, $this->only('password'))) {
            RateLimiter::hit($this->throttleKey());

            // Log failed login
            $this->securityLogger->logFailedLogin(
                $this->input('email'),
                $this
            );

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        // Log successful validation (login akan di-log di controller)
        return $user;
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        // Log account lockout
        $this->securityLogger->logAccountLockout(
            $this->input('email'),
            $this
        );

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }
}
```

---

### 2.5 Activity Logging dengan Spatie

**Configure Model**: `app/Models/User.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, LogsActivity;

    // ... existing code

    /**
     * Configure activity logging
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'email',
                'role',
                'full_name',
                'is_active',
                'member_number',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => match($eventName) {
                'created' => 'User account created',
                'updated' => 'User profile updated',
                'deleted' => 'User account deleted',
                default => "User {$eventName}",
            });
    }
}
```

**Run Migration**:
```bash
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"
php artisan migrate
```

---

## 3. Medium Priority Improvements

### 3.1 Reduce Session Timeout

**File**: `.env`

```env
# Security improvements
SESSION_LIFETIME=30
SESSION_EXPIRE_ON_CLOSE=true
AUTH_PASSWORD_TIMEOUT=900
```

---

### 3.2 Global Rate Limiting

**File**: `bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

    // Global rate limiting
    $middleware->web(append: [
        'throttle:120,1', // 120 requests per minute per IP
        HandleAppearance::class,
        HandleInertiaRequests::class,
        AddLinkHeadersForPreloadedAssets::class,
        SecurityHeaders::class,
    ]);
})
```

Or more sophisticated per-user:
```php
// app/Providers/FortifyServiceProvider.php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

public function boot(): void
{
    // ... existing code

    // Global rate limiter
    RateLimiter::for('global', function (Request $request) {
        return Limit::perMinute(120)
            ->by($request->user()?->id ?: $request->ip())
            ->response(function () {
                return response('Too many requests. Please slow down.', 429);
            });
    });

    // API rate limiter (jika ada API)
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)
            ->by($request->user()?->id ?: $request->ip());
    });
}
```

---

### 3.3 Content Security Policy (CSP)

Install package:
```bash
composer require spatie/laravel-csp
```

**Publish config**:
```bash
php artisan vendor:publish --provider="Spatie\Csp\CspServiceProvider"
```

**Configure**: `config/csp.php`

```php
<?php

return [
    'enabled' => env('CSP_ENABLED', true),

    'policy' => [
        'default-src' => ['self'],
        'script-src' => ['self', 'unsafe-inline', 'unsafe-eval'], // For Vite
        'style-src' => ['self', 'unsafe-inline'],
        'img-src' => ['self', 'data:', 'https:'],
        'font-src' => ['self', 'data:'],
        'connect-src' => ['self'],
        'frame-ancestors' => ['self'],
        'base-uri' => ['self'],
        'form-action' => ['self'],
    ],

    'report_only' => env('CSP_REPORT_ONLY', false),

    'report_uri' => env('CSP_REPORT_URI', ''),
];
```

**Register Middleware**: `bootstrap/app.php`

```php
use Spatie\Csp\AddCspHeaders;

$middleware->web(append: [
    'throttle:120,1',
    HandleAppearance::class,
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
    SecurityHeaders::class,
    AddCspHeaders::class,
]);
```

---

## 4. Testing Security Improvements

### 4.1 Security Test Suite

**Create**: `tests/Feature/Security/SecurityTest.php`

```php
<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_enforces_https_in_production()
    {
        // Set production environment
        config(['app.env' => 'production']);

        $response = $this->get('/');

        // Should redirect to HTTPS
        $this->assertTrue(
            str_starts_with(url('/'), 'https://'),
            'URLs should use HTTPS in production'
        );
    }

    /** @test */
    public function it_includes_security_headers()
    {
        $response = $this->get('/');

        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
    }

    /** @test */
    public function it_does_not_expose_sensitive_user_data_in_props()
    {
        $user = User::factory()->create([
            'password' => bcrypt('secret-password'),
            'two_factor_secret' => 'secret-2fa-key',
        ]);

        $this->actingAs($user);

        $response = $this->get('/admin/dashboard');

        // Get Inertia props
        $props = $response->viewData('page')['props'];

        // Should have user data
        $this->assertArrayHasKey('auth', $props);
        $this->assertArrayHasKey('user', $props['auth']);

        // Should NOT expose sensitive fields
        $userData = $props['auth']['user'];
        $this->assertArrayNotHasKey('password', $userData);
        $this->assertArrayNotHasKey('two_factor_secret', $userData);
        $this->assertArrayNotHasKey('two_factor_recovery_codes', $userData);
        $this->assertArrayNotHasKey('remember_token', $userData);
    }

    /** @test */
    public function it_prevents_admin_access_for_non_admin_users()
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user);

        $response = $this->get('/admin/dashboard');

        $response->assertForbidden();
    }

    /** @test */
    public function it_rate_limits_login_attempts()
    {
        // Try to login 6 times with wrong credentials
        for ($i = 0; $i < 6; $i++) {
            $response = $this->post('/login', [
                'email' => 'test@example.com',
                'password' => 'wrong-password',
            ]);
        }

        // 6th attempt should be rate limited
        $response->assertSessionHasErrors(['email']);
        $this->assertTrue(
            str_contains($response->getContent(), 'throttle'),
            'Should show rate limit message'
        );
    }

    /** @test */
    public function it_prevents_sql_injection_in_user_search()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // Try SQL injection
        $response = $this->get('/admin/users?search=\' OR 1=1--');

        // Should not cause SQL error (Eloquent protects us)
        $response->assertOk();
    }

    /** @test */
    public function it_validates_file_upload_type()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // Try to upload PHP file as image
        $phpFile = \Illuminate\Http\UploadedFile::fake()->create('malicious.php', 100);

        $response = $this->post('/admin/users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'user',
            'member_number' => 'M9999',
            'full_name' => 'Test User',
            'address' => 'Test Address',
            'phone' => '1234567890',
            'image' => $phpFile,
        ]);

        $response->assertSessionHasErrors(['image']);
    }

    /** @test */
    public function it_prevents_user_from_deleting_themselves()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $response = $this->delete("/admin/users/{$admin->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    /** @test */
    public function it_logs_security_events()
    {
        // This would require actual logging implementation
        // For now, we can test that the logger service works

        $this->markTestIncomplete('Security logging tests to be implemented');
    }
}
```

**Run Tests**:
```bash
php artisan test --filter=SecurityTest
```

---

## 5. Deployment Checklist Script

**Create**: `scripts/security-check.sh`

```bash
#!/bin/bash

echo "🔒 Security Deployment Checklist"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_env() {
    if grep -q "APP_DEBUG=true" .env; then
        echo -e "${RED}✗${NC} APP_DEBUG is true (should be false in production)"
        return 1
    else
        echo -e "${GREEN}✓${NC} APP_DEBUG is false"
        return 0
    fi
}

check_env_production() {
    if grep -q "APP_ENV=production" .env; then
        echo -e "${GREEN}✓${NC} APP_ENV is production"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} APP_ENV is not production"
        return 1
    fi
}

check_app_key() {
    if grep -q "APP_KEY=$" .env || ! grep -q "APP_KEY=" .env; then
        echo -e "${RED}✗${NC} APP_KEY is not set"
        return 1
    else
        echo -e "${GREEN}✓${NC} APP_KEY is set"
        return 0
    fi
}

check_session_secure() {
    if grep -q "SESSION_SECURE_COOKIE=true" .env; then
        echo -e "${GREEN}✓${NC} SESSION_SECURE_COOKIE is true"
        return 0
    else
        echo -e "${RED}✗${NC} SESSION_SECURE_COOKIE should be true"
        return 1
    fi
}

check_dependencies() {
    echo "Running composer audit..."
    if composer audit; then
        echo -e "${GREEN}✓${NC} No composer vulnerabilities"
        return 0
    else
        echo -e "${RED}✗${NC} Composer vulnerabilities found"
        return 1
    fi
}

check_npm_audit() {
    echo "Running npm audit..."
    if npm audit --audit-level=high; then
        echo -e "${GREEN}✓${NC} No critical npm vulnerabilities"
        return 0
    else
        echo -e "${RED}✗${NC} NPM vulnerabilities found"
        return 1
    fi
}

# Run checks
echo "📋 Environment Configuration"
echo "----------------------------"
check_env
check_env_production
check_app_key
check_session_secure
echo ""

echo "📦 Dependencies"
echo "---------------"
check_dependencies
echo ""
check_npm_audit
echo ""

echo "🧪 Running Security Tests"
echo "-------------------------"
php artisan test --filter=SecurityTest

echo ""
echo "================================"
echo "Security check complete!"
echo "Review any issues above before deploying to production."
```

**Make executable**:
```bash
chmod +x scripts/security-check.sh
```

---

## Summary

Implementasi security improvements di atas akan:

1. ✅ Menghilangkan weak default passwords
2. ✅ Mencegah sensitive data exposure
3. ✅ Validasi file upload yang proper
4. ✅ Enforce HTTPS di production
5. ✅ Add security headers
6. ✅ Implement security logging
7. ✅ Add activity logging
8. ✅ Reduce session timeouts
9. ✅ Add rate limiting
10. ✅ Implement CSP

Setelah implementasi, jalankan:
```bash
# Run security checks
./scripts/security-check.sh

# Run all tests
php artisan test

# Check code quality
./vendor/bin/phpstan analyse
./vendor/bin/pint --test
```

**IMPORTANT**: Review dan test semua perubahan di staging environment sebelum deploy ke production!
