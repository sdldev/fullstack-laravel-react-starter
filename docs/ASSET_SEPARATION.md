# Asset Separation: Admin Dashboard vs Site

## Ringkasan

Repository ini menggunakan pemisahan asset yang jelas antara **Admin Dashboard** dan **Site** (public/user-facing pages). Pemisahan ini mencakup:

1. **Entry Points terpisah** di Vite
2. **Blade templates terpisah** 
3. **Route detection otomatis** melalui middleware
4. **Page components terpisah** per namespace

## Struktur File

### Backend

```
app/Http/Controllers/
├── Admin/              # Controllers untuk admin dashboard
│   ├── DashboardController.php
│   ├── UserController.php
│   └── ...
└── Site/               # Controllers untuk public site
    └── HomeController.php

routes/
├── admin.php          # Admin routes (/admin/*)
└── web.php            # Site routes (/, /dashboard, /settings/*)
```

### Frontend

```
resources/
├── views/
│   ├── admin/
│   │   └── app.blade.php      # Admin template (loads admin.tsx)
│   ├── site/
│   │   └── app.blade.php      # Site template (loads site.tsx)
│   └── app.blade.php          # [DEPRECATED] Legacy template
│
└── js/
    ├── entries/
    │   ├── admin.tsx          # Admin entry point
    │   ├── admin-ssr.tsx      # Admin SSR entry
    │   ├── site.tsx           # Site entry point
    │   └── site-ssr.tsx       # Site SSR entry
    │
    └── pages/
        ├── admin/             # Admin pages (dashboard, users, settings, etc)
        ├── site/              # Site pages (home, etc)
        ├── auth/              # Auth pages (login, register, etc) - uses site template
        ├── settings/          # User settings - uses site template
        └── dashboard.tsx      # User dashboard - uses site template
```

## Cara Kerja

### 1. Vite Configuration

File `vite.config.ts` mendefinisikan dua entry points terpisah:

```typescript
laravel({
    input: [
        'resources/js/entries/admin.tsx',
        'resources/js/entries/site.tsx',
    ],
    ssr: [
        'resources/js/entries/admin-ssr.tsx',
        'resources/js/entries/site-ssr.tsx',
    ],
})
```

### 2. Middleware: Root View Selection

`HandleInertiaRequests` middleware secara otomatis mendeteksi route dan memilih template yang sesuai:

```php
public function rootView(Request $request): string
{
    // Admin routes: /admin atau /admin/*
    if ($request->is('admin') || $request->is('admin/*')) {
        return 'admin/app';
    }

    // Semua route lainnya menggunakan site template
    return 'site/app';
}
```

### 3. Blade Templates

**Admin Template** (`resources/views/admin/app.blade.php`):
```blade
@vite(['resources/js/entries/admin.tsx', "resources/js/pages/{$page['component']}.tsx"])
```

**Site Template** (`resources/views/site/app.blade.php`):
```blade
@vite(['resources/js/entries/site.tsx', "resources/js/pages/{$page['component']}.tsx"])
```

### 4. Entry Points

**Admin Entry** (`resources/js/entries/admin.tsx`):
- Includes `Toaster` component for notifications
- Title format: `"${title} - Admin - ${appName}"`
- Initializes admin-specific features

**Site Entry** (`resources/js/entries/site.tsx`):
- Simpler, no Toaster
- Title format: `"${title} - ${appName}"`
- Focused on public/user features

## Route Mapping

| Route Pattern | Template | Entry Point | Page Namespace |
|--------------|----------|-------------|----------------|
| `/admin/*` | `admin/app` | `admin.tsx` | `admin/*` |
| `/` | `site/app` | `site.tsx` | `site/home` |
| `/dashboard` | `site/app` | `site.tsx` | `dashboard` |
| `/settings/*` | `site/app` | `site.tsx` | `settings/*` |
| `/login`, `/register`, etc | `site/app` | `site.tsx` | `auth/*` |

## Build Output

Ketika menjalankan `npm run build`, Vite akan menghasilkan bundle terpisah:

```
public/build/
├── assets/
│   ├── admin-[hash].js       # Admin bundle
│   ├── site-[hash].js        # Site bundle
│   ├── vendor-[hash].js      # Shared vendor code (React, dll)
│   └── ...
└── manifest.json
```

### Code Splitting Benefits

1. **Smaller Initial Load**: User site tidak perlu download admin code
2. **Better Caching**: Admin updates tidak mempengaruhi site bundle
3. **Parallel Loading**: Browser bisa download chunks secara parallel
4. **Optimized Chunks**: Vendor code (React, Inertia) di-share antar bundles

## Testing

Test suite memverifikasi bahwa pemisahan asset berfungsi dengan benar:

```bash
php artisan test --filter AssetSeparationTest
```

Tests mencakup:
- ✅ Admin routes load admin template
- ✅ Site routes load site template
- ✅ Middleware correctly determines root view
- ✅ Each route type uses correct entry point

## Menambahkan Feature Baru

### Admin Feature

1. **Controller**: `app/Http/Controllers/Admin/NewFeatureController.php`
2. **Route**: Tambahkan di `routes/admin.php`
3. **Page**: Buat di `resources/js/pages/admin/new-feature/Index.tsx`
4. **Automatic**: Middleware akan otomatis load `admin/app` template

### Site Feature

1. **Controller**: `app/Http/Controllers/Site/NewFeatureController.php`
2. **Route**: Tambahkan di `routes/web.php`
3. **Page**: Buat di `resources/js/pages/site/new-feature.tsx`
4. **Automatic**: Middleware akan otomatis load `site/app` template

## Troubleshooting

### Issue: Wrong template loaded

**Solusi**: Periksa route pattern di middleware. Admin routes harus mulai dengan `/admin`.

### Issue: Asset tidak terload

**Solusi**: 
1. Pastikan blade template menggunakan `@vite()` directive yang benar
2. Jalankan `npm run build` untuk production
3. Jalankan `npm run dev` untuk development

### Issue: Code dari admin muncul di site

**Solusi**: Pastikan import statement tidak cross-reference antar namespace.

## Kesimpulan

Pemisahan asset antara admin dan site **sudah berjalan dengan baik** dengan struktur yang solid:

✅ **Separation of Concerns**: Admin dan Site code terpisah jelas  
✅ **Automatic Detection**: Middleware otomatis pilih template yang tepat  
✅ **Optimized Bundling**: Vite menghasilkan bundles terpisah dan efisien  
✅ **Maintainable**: Struktur jelas dan mudah di-maintain  
✅ **Tested**: Test suite memverifikasi fungsi pemisahan  

Implementasi ini mengikuti best practices Laravel + Inertia + Vite untuk multi-entry point applications.
