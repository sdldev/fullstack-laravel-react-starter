# 🚨 Immediate Security Fixes Required

**CRITICAL**: These fixes MUST be implemented before ANY production deployment

**Date**: 15 Oktober 2025  
**Audit Reference**: SECURITY_AUDIT_2025.md

---

## 🔴 CRITICAL FIX #1: Weak Seeder Passwords

**Priority**: 🔥 **IMMEDIATE - DO NOT DEPLOY WITHOUT THIS FIX**

**File**: `database/seeders/UserSeeder.php`

### Current (UNSAFE):
```php
// Line 19
'password' => Hash::make('password'),

// Line 45
'password' => Hash::make('inipasswordnya'),
```

### Solution Options:

#### Option A: Environment Variable (RECOMMENDED)
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user - MUST set ADMIN_DEFAULT_PASSWORD in .env
        $adminPassword = env('ADMIN_DEFAULT_PASSWORD');
        if (!$adminPassword) {
            throw new \Exception(
                'ADMIN_DEFAULT_PASSWORD must be set in .env file for seeding. ' .
                'This is required to prevent using weak default passwords.'
            );
        }

        User::create([
            'name' => 'Super User',
            'email' => 'admin@admin.com',
            'password' => Hash::make($adminPassword),
            'image' => 'default.png',
            'role' => 'admin',
            'is_active' => true,
            'member_number' => 'M0001',
            'full_name' => 'Super Admin',
            'address' => 'Jl. Super Admin No. 1',
            'phone' => '081234567890',
            'join_date' => now(),
            'note' => 'This is a super admin user',
        ]);

        // Regular users - generate random passwords
        for ($i = 1; $i <= 40; $i++) {
            $faker = \Faker\Factory::create('id_ID');
            $genders = ['L', 'P'];
            $gender = $faker->randomElement($genders);
            $firstName = $gender === 'L' ? $faker->firstNameMale : $faker->firstNameFemale;
            $lastName = $faker->lastName;

            // Generate random password
            $userPassword = Str::random(16);
            
            // In development, you might want to log these
            if (app()->environment('local')) {
                $this->command->info("User {$i}: user{$i}@santrimu.com / {$userPassword}");
            }

            User::create([
                'name' => $firstName.' '.$lastName,
                'email' => 'user'.$i.'@santrimu.com',
                'password' => Hash::make($userPassword),
                'image' => 'default.png',
                'role' => 'user',
                'is_active' => true,
                'member_number' => 'M'.str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'full_name' => $firstName.' '.$lastName,
                'address' => $faker->address,
                'phone' => $faker->phoneNumber,
                'join_date' => $faker->date(),
                'note' => 'This is user number '.$i,
            ]);
        }
    }
}
```

#### Option B: Force Password Change on First Login (BEST FOR PRODUCTION)

1. Add migration for password change tracking:
```bash
php artisan make:migration add_password_tracking_to_users_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('password_changed_at')->nullable()->after('password');
            $table->boolean('must_change_password')->default(false)->after('password_changed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['password_changed_at', 'must_change_password']);
        });
    }
};
```

2. Update seeder:
```php
User::create([
    'name' => 'Super User',
    'email' => 'admin@admin.com',
    'password' => Hash::make(Str::random(24)), // Random password
    'must_change_password' => true, // Force change on first login
    // ... rest of fields
]);
```

3. Add middleware to enforce password change:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            if (!$request->routeIs('password.change*')) {
                return redirect()->route('password.change')
                    ->with('warning', 'You must change your password before continuing.');
            }
        }

        return $next($request);
    }
}
```

### Required .env Update:
```env
# Add to .env.example and .env
ADMIN_DEFAULT_PASSWORD=your-very-strong-password-here-min-20-chars
```

### Testing:
```bash
# 1. Clear database
php artisan migrate:fresh

# 2. Set strong password in .env
# Edit .env and add:
# ADMIN_DEFAULT_PASSWORD=SecureP@ssw0rd!2025MinLength20Chars

# 3. Run seeder
php artisan db:seed --class=UserSeeder

# 4. Try to login with old passwords (should fail)
# 5. Try to login with new password (should succeed)
```

---

## 🟠 HIGH PRIORITY FIX #1: Security Logging Channel

**Priority**: Fix within 24-48 hours

**File**: `config/logging.php`

### Add Security Channel:
```php
<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;
use Monolog\Processor\PsrLogMessageProcessor;

return [
    'default' => env('LOG_CHANNEL', 'stack'),

    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace' => env('LOG_DEPRECATIONS_TRACE', false),
    ],

    'channels' => [
        // ... existing channels ...

        // ADD THIS:
        'security' => [
            'driver' => 'daily',
            'path' => storage_path('logs/security.log'),
            'level' => env('LOG_LEVEL', 'info'),
            'days' => 90, // Keep security logs for 90 days
            'replace_placeholders' => true,
        ],

        // ... rest of channels ...
    ],
];
```

### Create logs directory if needed:
```bash
mkdir -p storage/logs
chmod -R 775 storage/logs
```

### Test:
```bash
php artisan tinker
# Run:
Log::channel('security')->info('Test security log');
exit

# Check if log file created:
cat storage/logs/security.log
```

---

## 🟠 HIGH PRIORITY FIX #2: Integrate Security Logging with Authentication

**Priority**: Fix within 24-48 hours

**File**: `app/Http/Requests/Auth/LoginRequest.php`

### Update LoginRequest to use SecurityLogger:

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
    // Inject SecurityLogger
    public function __construct(private SecurityLogger $securityLogger)
    {
        parent::__construct();
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            // LOG FAILED LOGIN
            $this->securityLogger->logFailedLogin(
                $this->input('email'),
                $this
            );

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // LOG SUCCESSFUL LOGIN
        $this->securityLogger->logSuccessfulLogin(Auth::user(), $this);

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        // LOG ACCOUNT LOCKOUT
        $this->securityLogger->logAccountLockout(
            $this->input('email'),
            $this
        );

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
```

### Update SecurityLogger with missing methods:

**File**: `app/Services/SecurityLogger.php`

```php
<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecurityLogger
{
    public function logFailedLogin(string $email, Request $request): void
    {
        Log::channel('security')->warning('Failed login attempt', [
            'email' => $email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function logSuccessfulLogin($user, Request $request): void
    {
        Log::channel('security')->info('Successful login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function logAccountLockout(string $email, Request $request): void
    {
        Log::channel('security')->alert('Account locked due to too many failed attempts', [
            'email' => $email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function logUnauthorizedAccess($user, string $action, Request $request): void
    {
        Log::channel('security')->warning('Unauthorized access attempt', [
            'user_id' => $user?->id,
            'email' => $user?->email,
            'action' => $action,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
```

### Test:
```bash
# 1. Try failed login
curl -X POST http://localhost/login \
  -d "email=test@test.com" \
  -d "password=wrong"

# 2. Check security log
tail -f storage/logs/security.log

# 3. Try successful login
# 4. Check log again

# 5. Try 6 failed logins to trigger lockout
# 6. Verify lockout is logged
```

---

## 🟠 HIGH PRIORITY FIX #3: Update .env.example with Secure Defaults

**Priority**: Fix within 24-48 hours

**File**: `.env.example`

### Update with secure defaults and documentation:

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=false  # ← CHANGED: false by default for security
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error  # ← CHANGED: error by default (use debug only in local)

DB_CONNECTION=sqlite

# Session Security - IMPORTANT FOR PRODUCTION
SESSION_DRIVER=database
SESSION_LIFETIME=30  # ← CHANGED: 30 minutes instead of 120
SESSION_ENCRYPT=true  # ← CHANGED: true for security
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_EXPIRE_ON_CLOSE=true  # ← CHANGED: sessions expire on browser close
SESSION_SECURE_COOKIE=false  # Set to true in production with HTTPS

# Authentication Security
AUTH_PASSWORD_TIMEOUT=900  # ← ADDED: 15 minutes (900 seconds)

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

# Seeder Security - REQUIRED FOR DATABASE SEEDING
# Generate strong password: openssl rand -base64 24
ADMIN_DEFAULT_PASSWORD=  # ← ADDED: Must be set for seeding

# Production Environment Configuration
# When deploying to production, also set:
# - APP_ENV=production
# - APP_DEBUG=false (already set above)
# - APP_URL=https://yourdomain.com
# - SESSION_SECURE_COOKIE=true
# - LOG_LEVEL=error
```

---

## ✅ Verification Checklist

After implementing these fixes:

### CRITICAL
- [ ] Weak seeder passwords FIXED
- [ ] Tested database seeding with new password approach
- [ ] Verified cannot login with old weak passwords
- [ ] Strong admin password set in .env

### HIGH PRIORITY
- [ ] Security logging channel configured
- [ ] SecurityLogger integrated with LoginRequest
- [ ] Tested failed login logging
- [ ] Tested successful login logging
- [ ] Tested lockout logging
- [ ] .env.example updated with secure defaults

### Testing
- [ ] Run: `php artisan migrate:fresh --seed`
- [ ] Try login with old "password" (should fail)
- [ ] Try login with new admin password (should work)
- [ ] Check `storage/logs/security.log` exists and has entries
- [ ] Trigger rate limiting (6 failed logins)
- [ ] Verify lockout is logged

### Documentation
- [ ] Team informed about .env changes
- [ ] Deployment checklist updated
- [ ] Production environment ready with correct .env values

---

## 📞 Support

If you encounter issues:
1. Check SECURITY_AUDIT_2025.md for detailed analysis
2. Review SECURITY_IMPROVEMENTS.md for additional guidance
3. Test in development environment first
4. Document any problems encountered

---

**DO NOT DEPLOY TO PRODUCTION WITHOUT FIXING THE CRITICAL ISSUE**

**Status**: 🚨 **IMMEDIATE ACTION REQUIRED**  
**Next Review**: After implementing these fixes
