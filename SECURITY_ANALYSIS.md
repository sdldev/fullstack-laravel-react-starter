# Analisis Keamanan dan Kerentanan Aplikasi

## Ringkasan Eksekutif

Dokumen ini berisi analisis komprehensif terhadap keamanan aplikasi Laravel 12 + React 19 + Inertia.js starter template. Analisis mencakup identifikasi kerentanan, penilaian risiko, dan rekomendasi perbaikan.

**Status Keseluruhan**: ⚠️ **MODERATE RISK** - Beberapa kerentanan keamanan perlu ditangani sebelum production deployment.

---

## 1. Autentikasi dan Otorisasi

### ✅ Implementasi yang Baik

1. **Two-Factor Authentication (2FA)**
   - ✅ Menggunakan Laravel Fortify dengan 2FA
   - ✅ Rate limiting untuk 2FA attempts (5 per menit)
   - ✅ Password confirmation untuk akses 2FA settings
   - Lokasi: `config/fortify.php`, `app/Providers/FortifyServiceProvider.php`

2. **Password Hashing**
   - ✅ Menggunakan bcrypt untuk password hashing
   - ✅ BCRYPT_ROUNDS=12 (cukup kuat)
   - Lokasi: `.env.example`, `app/Http/Controllers/Admin/UserController.php`

3. **Rate Limiting Login**
   - ✅ Login throttling: 5 attempts per email+IP combination
   - ✅ Lockout event triggered saat terlalu banyak attempts
   - Lokasi: `app/Http/Requests/Auth/LoginRequest.php`

### ⚠️ Kerentanan dan Risiko

#### CRITICAL: Weak Default Passwords in Seeder

**Deskripsi**: Password default yang lemah dan dapat diprediksi
```php
// database/seeders/UserSeeder.php
'password' => Hash::make('password'),      // Admin
'password' => Hash::make('inipasswordnya'), // Regular users
```

**Risiko**: 
- Password mudah ditebak (dictionary attack)
- Akun admin dengan password "password" sangat berbahaya
- Jika seeder dijalankan di production, semua akun vulnerable

**Dampak**: 🔴 **CRITICAL**

**Rekomendasi**:
```php
// Gunakan password yang kuat atau generate random
'password' => Hash::make(Str::random(16)),
// Atau paksa user change password saat first login
```

#### HIGH: Admin Authorization Menggunakan String Comparison

**Deskripsi**: Authorization check hanya mengandalkan field `role`
```php
// app/Providers/AppServiceProvider.php
Gate::define('admin', function ($user) {
    return $user->role === 'admin';
});

// app/Http/Requests/Admin/StoreUserRequest.php
return auth()->check() && auth()->user()->role === 'admin';
```

**Risiko**:
- Tidak ada granular permissions
- Semua admin memiliki akses penuh (no separation of duties)
- Tidak ada audit trail untuk privilege escalation

**Dampak**: 🟠 **HIGH**

**Rekomendasi**:
- Implementasi role-based access control (RBAC) yang lebih robust
- Gunakan package seperti `spatie/laravel-permission`
- Implementasi granular permissions (view, create, update, delete)

#### MEDIUM: Session Timeout yang Terlalu Panjang

**Deskripsi**: Session lifetime 120 menit (2 jam)
```php
// config/session.php
'lifetime' => (int) env('SESSION_LIFETIME', 120),
```

**Risiko**:
- Session hijacking window terlalu lama
- Unattended sessions bisa diakses orang lain

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```env
SESSION_LIFETIME=30  # 30 menit untuk aplikasi yang lebih secure
SESSION_EXPIRE_ON_CLOSE=true  # Session expire saat browser ditutup
```

#### MEDIUM: Password Confirmation Timeout Terlalu Lama

**Deskripsi**: Password confirmation valid selama 3 jam
```php
// config/auth.php
'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800), // 3 hours
```

**Risiko**: User tidak perlu re-confirm password untuk aksi sensitive terlalu lama

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```env
AUTH_PASSWORD_TIMEOUT=900  # 15 menit
```

#### LOW: Session Encryption Disabled

**Deskripsi**: Session data tidak dienkripsi
```php
// config/session.php
'encrypt' => env('SESSION_ENCRYPT', false),
```

**Risiko**: Session data bisa dibaca jika storage compromise

**Dampak**: 🟢 **LOW**

**Rekomendasi**:
```env
SESSION_ENCRYPT=true
```

---

## 2. Input Validation dan Sanitization

### ✅ Implementasi yang Baik

1. **FormRequest Validation**
   - ✅ Menggunakan Laravel FormRequest untuk validasi
   - ✅ Validasi email dengan unique check
   - ✅ Validasi file upload dengan type dan size limits
   - Lokasi: `app/Http/Requests/Admin/StoreUserRequest.php`

2. **XSS Protection**
   - ✅ React secara default escape output (mencegah XSS)
   - ✅ Minimal penggunaan `dangerouslySetInnerHTML`

### ⚠️ Kerentanan dan Risiko

#### MEDIUM: Penggunaan dangerouslySetInnerHTML

**Deskripsi**: QR code SVG dirender menggunakan `dangerouslySetInnerHTML`
```tsx
// resources/js/components/two-factor-setup-modal.tsx
<div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
```

**Risiko**: Jika QR code SVG dari backend compromised, bisa XSS

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
- Validate dan sanitize SVG content di backend
- Gunakan library seperti DOMPurify untuk sanitize HTML
- Atau render SVG sebagai React component

#### LOW: Validation Message Injection

**Deskripsi**: Custom validation messages menggunakan user input
```php
// app/Http/Requests/Admin/StoreUserRequest.php
'email.unique' => ':attribute sudah terdaftar.',
```

**Risiko**: Minimal karena Laravel sanitize validation messages

**Dampak**: 🟢 **LOW**

**Rekomendasi**: Continue using Laravel's built-in validation (already safe)

---

## 3. Cross-Site Request Forgery (CSRF)

### ✅ Implementasi yang Baik

1. **CSRF Protection Default**
   - ✅ Laravel CSRF middleware enabled by default
   - ✅ Inertia.js otomatis handle CSRF tokens
   - Lokasi: `bootstrap/app.php`

2. **Form Submission**
   - ✅ Inertia forms automatically include CSRF token
   - ✅ `router.post/put/delete` methods include CSRF

### ⚠️ Kerentanan dan Risiko

#### INFO: Cookies Not Encrypted

**Deskripsi**: Beberapa cookies dikecualikan dari encryption
```php
// bootstrap/app.php
$middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
```

**Risiko**: Cookie ini bisa dibaca/dimodifikasi oleh client

**Dampak**: ℹ️ **INFO** (by design untuk client-side cookies)

**Rekomendasi**: Pastikan tidak ada data sensitive di cookies ini

---

## 4. File Upload Security

### ✅ Implementasi yang Baik

1. **File Type Validation**
   - ✅ MIME type validation: `mimes:jpeg,png,jpg,gif`
   - ✅ File size limit: max 2048KB
   - Lokasi: `app/Http/Requests/Admin/StoreUserRequest.php`

### ⚠️ Kerentanan dan Risiko

#### HIGH: No File Content Validation

**Deskripsi**: Hanya validasi MIME type, tidak ada content validation
```php
'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
```

**Risiko**:
- File extension bisa diubah untuk bypass MIME check
- Malicious file bisa di-upload dengan extension image
- No virus/malware scanning

**Dampak**: 🟠 **HIGH**

**Rekomendasi**:
```php
// Install intervention/image (already included)
use Intervention\Image\Laravel\Facades\Image;

// Dalam controller, validate actual image content
if ($request->hasFile('image')) {
    try {
        // Validate it's a real image by trying to read it
        $image = Image::read($request->file('image'));
        
        // Resize untuk security (prevent decompression bombs)
        $image->scale(width: 1000);
        
        // Save dengan format yang diketahui aman
        $path = 'users/' . uniqid() . '.jpg';
        Storage::disk('public')->put($path, $image->encodeByMediaType('image/jpeg'));
        
        $data['image'] = $path;
    } catch (\Exception $e) {
        return back()->withErrors(['image' => 'Invalid image file']);
    }
}
```

#### MEDIUM: Predictable File Paths

**Deskripsi**: File disimpan dengan path predictable
```php
$request->file('image')->store('users', 'public');
```

**Risiko**: Attacker bisa guess file location

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```php
// Generate unique filename
$filename = uniqid() . '_' . Str::random(10) . '.' . $file->extension();
$path = $file->storeAs('users', $filename, 'public');
```

#### MEDIUM: No File Deletion Protection

**Deskripsi**: File lama dihapus tanpa validasi tambahan
```php
if ($user->image && \Storage::disk('public')->exists($user->image)) {
    \Storage::disk('public')->delete($user->image);
}
```

**Risiko**: 
- Race condition: file bisa dihapus saat masih digunakan
- Path traversal jika `$user->image` compromised

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```php
// Validate path tidak keluar dari allowed directory
$imagePath = $user->image;
$allowedPath = 'users/';

if ($imagePath && str_starts_with($imagePath, $allowedPath)) {
    if (Storage::disk('public')->exists($imagePath)) {
        Storage::disk('public')->delete($imagePath);
    }
}
```

---

## 5. SQL Injection Protection

### ✅ Implementasi yang Baik

1. **Eloquent ORM**
   - ✅ Semua query menggunakan Eloquent ORM
   - ✅ Tidak ada raw SQL queries ditemukan
   - ✅ Parameter binding otomatis

**Status**: ✅ **AMAN** - Tidak ada SQL injection vulnerability ditemukan

---

## 6. Data Exposure dan Information Disclosure

### ⚠️ Kerentanan dan Risiko

#### CRITICAL: Sensitive Data Exposed di Inertia Props

**Deskripsi**: User object lengkap di-share ke frontend
```php
// app/Http/Middleware/HandleInertiaRequests.php
'auth' => [
    'user' => $request->user(),
],
```

**Risiko**: Semua user data, termasuk hidden fields, diekspos ke JavaScript

**Dampak**: 🔴 **CRITICAL**

**Rekomendasi**:
```php
'auth' => [
    'user' => $request->user() ? [
        'id' => $request->user()->id,
        'name' => $request->user()->name,
        'email' => $request->user()->email,
        'role' => $request->user()->role,
        'image' => $request->user()->image,
        'is_active' => $request->user()->is_active,
        // Jangan expose: password, two_factor_secret, recovery_codes
    ] : null,
],
```

#### HIGH: Pagination Exposes Internal Data

**Deskripsi**: Pagination object dari backend langsung di-pass ke frontend
```php
// app/Http/Controllers/Admin/UserController.php
'users' => User::paginate($perPage),
```

**Risiko**: Paginator includes SQL queries, timestamps, dll yang tidak perlu

**Dampak**: 🟠 **HIGH**

**Rekomendasi**:
```php
'users' => User::paginate($perPage)->through(fn ($user) => [
    'id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'role' => $user->role,
    'member_number' => $user->member_number,
    'is_active' => $user->is_active,
    'created_at' => $user->created_at->format('Y-m-d'),
    // Only expose what's needed
]),
```

#### MEDIUM: Debug Mode di Production

**Deskripsi**: ENV example memiliki debug mode enabled
```env
APP_DEBUG=true
```

**Risiko**: Error stack traces expose internal application structure

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```env
APP_DEBUG=false  # Always false in production
APP_ENV=production
LOG_LEVEL=error  # Only log errors in production
```

---

## 7. Dependency Security

### ✅ Dependencies Status

1. **Backend (Composer)**
   - ✅ Laravel Framework 12.0 (terbaru)
   - ✅ Laravel Fortify 1.30 (up-to-date)
   - ✅ Spatie packages (well-maintained)
   - ⚠️ Intervention/image 3.11 (check for updates)

2. **Frontend (NPM)**
   - ✅ React 19.0.0 (terbaru)
   - ✅ Inertia.js 2.1.4 (up-to-date)
   - ✅ Radix UI components (well-maintained)

### ⚠️ Kerentanan dan Risiko

#### MEDIUM: Outdated Dependencies Risk

**Deskripsi**: Dependencies perlu di-audit secara regular

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```bash
# Backend security audit
composer audit

# Frontend security audit
npm audit

# Keep dependencies updated
composer update
npm update
```

---

## 8. Rate Limiting dan DDoS Protection

### ✅ Implementasi yang Baik

1. **Login Rate Limiting**
   - ✅ 5 attempts per email+IP
   - Lokasi: `app/Http/Requests/Auth/LoginRequest.php`

2. **Password Update Throttling**
   - ✅ `throttle:6,1` middleware
   - Lokasi: `routes/settings.php`

3. **Two-Factor Rate Limiting**
   - ✅ 5 attempts per minute
   - Lokasi: `app/Providers/FortifyServiceProvider.php`

### ⚠️ Kerentanan dan Risiko

#### MEDIUM: No Global Rate Limiting

**Deskripsi**: Tidak ada global rate limiting untuk semua endpoints

**Risiko**: Endpoint lain bisa di-spam untuk DDoS

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```php
// bootstrap/app.php
$middleware->web(append: [
    'throttle:60,1', // 60 requests per minute per IP
]);

// Atau per-user throttling
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});
```

---

## 9. Logging dan Monitoring

### ⚠️ Kerentanan dan Risiko

#### HIGH: No Security Logging

**Deskripsi**: Tidak ada logging untuk security events

**Risiko**: Security incidents tidak ter-detect

**Dampak**: 🟠 **HIGH**

**Rekomendasi**:
```php
// Log security events
Log::channel('security')->warning('Failed login attempt', [
    'email' => $email,
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent(),
]);

// Monitor failed authentication
Log::channel('security')->alert('Account locked', [
    'user_id' => $user->id,
    'attempts' => $attempts,
]);
```

#### MEDIUM: Activity Logging Not Fully Implemented

**Deskripsi**: Spatie Activity Log ada tapi belum digunakan
```json
"spatie/laravel-activitylog": "^4.10",
```

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**:
```php
// Implement activity logging untuk admin actions
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable
{
    use LogsActivity;
    
    protected static $logAttributes = ['name', 'email', 'role'];
    protected static $logOnlyDirty = true;
}
```

---

## 10. HTTPS dan Transport Security

### ⚠️ Kerentanan dan Risiko

#### HIGH: No HTTPS Enforcement

**Deskripsi**: Tidak ada force HTTPS di aplikasi

**Risiko**: Man-in-the-middle attacks, credential theft

**Dampak**: 🟠 **HIGH**

**Rekomendasi**:
```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    if ($this->app->environment('production')) {
        URL::forceScheme('https');
    }
}
```

```env
# .env.production
APP_URL=https://yourdomain.com
SESSION_SECURE_COOKIE=true
```

#### MEDIUM: No Security Headers

**Deskripsi**: Missing security headers (CSP, HSTS, etc)

**Dampak**: 🟡 **MEDIUM**

**Rekomendasi**: Install `spatie/laravel-csp` atau add middleware:
```php
// Add security headers middleware
public function handle($request, Closure $next)
{
    $response = $next($request);
    
    $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    return $response;
}
```

---

## 11. API Security

### ℹ️ Status

**Tidak ada API endpoints saat ini** - Aplikasi menggunakan Inertia.js (server-rendered).

Jika akan menambahkan API:

**Rekomendasi**:
- Gunakan Laravel Sanctum untuk API authentication
- Implement API rate limiting
- API versioning
- Input validation yang ketat
- CORS configuration yang tepat

---

## 12. Backup dan Recovery

### ⚠️ Status

Spatie Laravel Backup sudah terinstall tapi perlu dikonfigurasi:
```json
"spatie/laravel-backup": "^9.3"
```

**Rekomendasi**:
```php
// config/backup.php
return [
    'backup' => [
        'name' => env('APP_NAME', 'laravel-backup'),
        'source' => [
            'files' => [
                'include' => [
                    base_path(),
                ],
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                ],
            ],
            'databases' => ['sqlite'],
        ],
        'destination' => [
            'disks' => ['backup'], // S3 or external storage
        ],
    ],
];
```

---

## Checklist Deployment Security

### Pre-Production Checklist

- [ ] **Environment Configuration**
  - [ ] `APP_DEBUG=false`
  - [ ] `APP_ENV=production`
  - [ ] `SESSION_ENCRYPT=true`
  - [ ] `SESSION_LIFETIME=30`
  - [ ] Strong `APP_KEY` generated
  - [ ] Database credentials secured

- [ ] **Authentication**
  - [ ] Change default seeder passwords
  - [ ] Enable 2FA for all admin users
  - [ ] Password policy enforced (min 12 chars)
  - [ ] Account lockout after failed attempts

- [ ] **Authorization**
  - [ ] Review all Gates and Policies
  - [ ] Test admin-only endpoints
  - [ ] Implement granular permissions

- [ ] **Data Protection**
  - [ ] Sensitive data not exposed in Inertia props
  - [ ] File upload validation implemented
  - [ ] Database encrypted (if needed)
  - [ ] Backup strategy configured

- [ ] **Network Security**
  - [ ] HTTPS enforced
  - [ ] Security headers configured
  - [ ] CORS properly configured (if API)
  - [ ] Firewall rules configured

- [ ] **Monitoring**
  - [ ] Security logging implemented
  - [ ] Activity logging enabled
  - [ ] Error monitoring (Sentry, etc)
  - [ ] Log rotation configured

- [ ] **Dependencies**
  - [ ] `composer audit` passed
  - [ ] `npm audit` passed
  - [ ] All packages up-to-date

- [ ] **Testing**
  - [ ] Security tests written
  - [ ] Penetration testing done
  - [ ] Load testing done

---

## Rekomendasi Prioritas

### 🔴 CRITICAL Priority (Fix Immediately)

1. **Change default passwords di seeder** - hapus atau gunakan strong random passwords
2. **Filter sensitive data di Inertia props** - jangan expose full user object

### 🟠 HIGH Priority (Fix Before Production)

1. Implement proper file content validation
2. Add HTTPS enforcement
3. Implement security logging
4. Add granular authorization dengan permissions
5. Filter pagination data exposure

### 🟡 MEDIUM Priority (Fix Soon)

1. Reduce session timeout
2. Add global rate limiting
3. Add security headers
4. Implement activity logging
5. Configure backup system

### 🟢 LOW Priority (Nice to Have)

1. Enable session encryption
2. Add CSP headers
3. Implement API security (if needed)
4. Add virus scanning untuk uploads

---

## Testing Security

### Security Testing Commands

```bash
# Backend security audit
composer audit

# Frontend security audit
npm audit

# Static analysis
./vendor/bin/phpstan analyse

# Code style check
./vendor/bin/pint --test

# Run tests
php artisan test
```

### Manual Security Testing

1. **Authentication Testing**
   ```bash
   # Test rate limiting
   curl -X POST http://localhost/login -d "email=test@test.com&password=wrong" --cookie-jar cookies.txt
   # Repeat 6 times, should be rate limited
   ```

2. **Authorization Testing**
   ```bash
   # Try accessing admin endpoint tanpa auth
   curl http://localhost/admin/users
   # Should redirect to login
   
   # Try accessing admin endpoint dengan user role
   # Should return 403
   ```

3. **File Upload Testing**
   ```bash
   # Try upload PHP file dengan image extension
   cp malicious.php evil.jpg
   # Should be rejected by validation
   ```

4. **XSS Testing**
   ```bash
   # Try inject XSS di form fields
   <script>alert('XSS')</script>
   # Should be escaped by React
   ```

---

## Kesimpulan

### Ringkasan Risiko

| Kategori | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Authentication | 1 | 1 | 2 | 1 |
| Authorization | 0 | 1 | 0 | 0 |
| Input Validation | 0 | 0 | 1 | 1 |
| Data Exposure | 1 | 1 | 1 | 0 |
| File Upload | 0 | 1 | 2 | 0 |
| Network Security | 0 | 1 | 1 | 0 |
| Logging | 0 | 1 | 1 | 0 |
| **Total** | **2** | **6** | **8** | **2** |

### Status Keseluruhan

Aplikasi memiliki **foundation keamanan yang baik** dengan menggunakan:
- Laravel's built-in security features
- Eloquent ORM (SQL injection protection)
- CSRF protection
- Rate limiting
- Two-factor authentication

Namun ada **beberapa kerentanan critical dan high** yang harus ditangani:
1. Default passwords yang weak
2. Sensitive data exposure di frontend
3. File upload validation yang inadequate
4. Missing security headers dan HTTPS enforcement

**Rekomendasi**: Prioritaskan perbaikan issues CRITICAL dan HIGH sebelum production deployment.

---

## Resources dan Referensi

### Documentation
- [Laravel Security Best Practices](https://laravel.com/docs/12.x/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Checklist](https://github.com/Snipe/laravel-security-checklist)

### Tools
- [Laravel Debugbar](https://github.com/barryvdh/laravel-debugbar) - Development only
- [Laravel Telescope](https://laravel.com/docs/telescope) - Monitoring
- [Sentry](https://sentry.io/) - Error tracking
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) - RBAC

### Security Services
- [Snyk](https://snyk.io/) - Dependency scanning
- [SonarQube](https://www.sonarqube.org/) - Code quality & security
- [Laravel Shift](https://laravelshift.com/) - Automated upgrades

---

**Tanggal Analisis**: 14 Oktober 2025  
**Versi Aplikasi**: Laravel 12 + React 19 + Inertia.js  
**Analyst**: GitHub Copilot Security Analysis

**Catatan**: Dokumen ini harus di-review dan di-update secara berkala seiring dengan perubahan aplikasi dan discovery vulnerability baru.
