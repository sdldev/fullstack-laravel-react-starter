# GitHub Copilot Instructions

## Architecture Overview

This is a Laravel 12 + React 19 + Inertia.js fullstack application with strict separation between admin (authenticated) and site (public) contexts.

### Key Structural Patterns

**Admin vs Site Separation:**
- **Admin routes**: `routes/admin.php` with `middleware(['auth', 'verified', 'can:admin'])`
- **Site routes**: `routes/web.php` for public access
- **Controllers**: `app/Http/Controllers/Admin/*` vs `app/Http/Controllers/Site/*`
- **Frontend pages**: `resources/js/pages/admin/*` vs `resources/js/pages/site/*`
- **Vite entries**: `resources/js/entries/admin.tsx` vs `resources/js/entries/site.tsx`

**Authentication & Authorization:**
- Role-based system with `admin` and `user` roles defined in User model
- Admin access controlled by `auth()->user()->role === 'admin'` checks
- Auto-approval for new user registrations (`is_active` defaults to `true`)
- FormRequest authorization in `authorize()` method

### File Organization Examples

**Adding Admin CRUD:**
```php
// routes/admin.php
Route::resource('admin/users', UserController::class)->names('admin.users');

// app/Http/Controllers/Admin/UserController.php
public function index(Request $request) {
    $users = User::paginate(15);
    return Inertia::render('admin/users/Index', [
        'users' => $users,
        'breadcrumbs' => [['title' => 'Users', 'href' => '/admin/users']]
    ]);
}
```

**Admin Page Component:**
```tsx
// resources/js/pages/admin/users/Index.tsx
import AppLayout from '@/layouts/app-layout';

export default function Index({ users, breadcrumbs }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Content */}
        </AppLayout>
    );
}
```

### Development Workflow

**Build Commands:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `composer run dev` - Alternative dev command
- `php artisan test` - Run Pest tests
- `vendor/bin/pint` - Code formatting

**Testing Patterns:**
- Use `RefreshDatabase` trait for feature tests
- Test admin authorization with `actingAs($admin)` where `$admin = User::factory()->create(['role' => 'admin'])`
- Assert Inertia components with `assertInertia(fn ($page) => $page->component('admin/users/Index'))`

### Code Conventions

**Backend:**
- FormRequest validation in `app/Http/Requests/Admin/*`
- Eager loading with `->with()` to prevent N+1 queries
- Bcrypt passwords: `$data['password'] = bcrypt($data['password'])`
- Image uploads: `$request->file('image')->store('users', 'public')`

**Frontend:**
- shadcn/ui components from `@/components/ui/*`
- AppLayout wrapper for admin pages with breadcrumbs
- TypeScript interfaces for props
- Pagination with `users.last_page > 1` condition

**Database:**
- Extended User model with role-based fields
- Boolean casting for `is_active`
- Date casting for `join_date`

### Common Patterns

**User Management:**
- Auto-approve new users: `$data['is_active'] = $data['is_active'] ?? true`
- Role validation: `'role' => 'required|string|in:admin,user'`
- Unique constraints: `'member_number' => 'nullable|string|max:255|unique:users'`

**UI Components:**
- Badge variants: `variant={user.role === 'admin' ? 'destructive' : 'secondary'}`
- Table actions: View/Edit/Delete buttons in flex container
- Pagination: Smart display with ellipsis for large page counts

### Key Files to Reference

- `vite.config.ts` - Build configuration with admin/site entries
- `bootstrap/app.php` - Route configuration and middleware
- `app/Models/User.php` - Extended user fields and casting
- `resources/js/entries/admin.tsx` - Admin Inertia app setup
- `tests/Feature/Admin/UserControllerTest.php` - Testing patterns</content>
<parameter name="filePath">/home/indatech/Documents/PROJECT/fullstack-laravel-react-starter/.github/copilot-instructions.md