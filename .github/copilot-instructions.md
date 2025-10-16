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
- `tests/Feature/Admin/UserControllerTest.php` - Testing patterns

## Code Quality & Static Analysis

### PHPStan Configuration

**PHPStan Level**: 5 (strict type checking)
- **Config File**: `phpstan.neon`
- **Command**: `./vendor/bin/phpstan analyze --memory-limit=2G`
- **Excluded Files**: 
  - `app/Services/HybridSecurityLogService.php` (reference implementation)
  - `app/Console/Commands/OptimizeSecurityLogs.php` (optional command)

### PHPStan Requirements (MUST)

When writing PHP code, ensure:

1. **Type Declarations**
   - All function parameters must have explicit type declarations
   - All function return types must be declared
   - Use union types where applicable: `string|int|null`
   - Example:
   ```php
   public function getUserData(int $userId, string $format = 'json'): array|null
   ```

2. **Variable Type Casting**
   - Cast regex matches and option values explicitly
   - Use `(int)`, `(string)`, `(float)`, `(bool)` casts when needed
   - Example:
   ```php
   $year = (int) $matches[1];
   $count = (int) $this->option('limit');
   $price = (float) $data['amount'];
   ```

3. **Array Type Hints**
   - Use `array<string, mixed>`, `array<int, Model>` for complex arrays
   - Use `list<T>` for indexed arrays
   - Example:
   ```php
   public function fetchUsers(): array<int, User> { }
   public function getConfig(): array<string, mixed> { }
   ```

4. **Nullable Types**
   - Use `?Type` or `Type|null` for nullable values
   - Example:
   ```php
   public function find(int $id): ?User { }
   public function getData(): string|null { }
   ```

5. **String Interpolation**
   - Don't use complex expressions in encapsed strings
   - Assign to variables first, then use in strings
   - Example (❌ WRONG):
   ```php
   echo "Count: {count($array)}";
   ```
   - Example (✅ CORRECT):
   ```php
   $count = count($array);
   echo "Count: {$count}";
   ```

6. **Static Method Calls**
   - Verify method exists before calling on facades/models
   - Use proper Laravel facades and methods
   - Example (✅ CORRECT):
   ```php
   Log::info('Message'); // ✅ Exists
   DB::table('users')->get(); // ✅ Exists
   ```

7. **Model & Class References**
   - Always define models with proper namespace imports
   - Don't reference non-existent classes
   - Example:
   ```php
   use App\Models\User;
   // Then use User::find($id)
   ```

### Before Submitting Code

**Always run PHPStan before committing:**
```bash
./vendor/bin/phpstan analyze --memory-limit=2G
```

**Expected output for clean code:**
```
[OK] No errors
```

**If errors appear:**
1. Fix type declarations first
2. Add proper casts for variables
3. Check for undefined classes/methods
4. Verify array type hints
5. Run tests to ensure functionality: `./vendor/bin/pest`

### Common PHPStan Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Parameter expects int, string given" | Option not cast | Use `(int) $this->option('name')` |
| "Call to undefined method" | Non-existent facade method | Check Laravel docs for correct method |
| "Cannot cast array to string" | Array in encapsed string | Extract to variable first |
| "Call to undefined class" | Model not imported or doesn't exist | Add `use App\Models\Model;` |
| "Unknown class" | Model/class not found | Create model or verify namespace |
| "Encapsed string part is non-string" | Non-scalar in string | Assign to variable, then use |

## Code Quality & ESLint Standards

### ESLint Configuration

**ESLint Setup**: TypeScript + React + Prettier integration
- **Config File**: `eslint.config.js`
- **Command**: `npx eslint . --fix`
- **Auto-fix**: Most issues fixed automatically with `--fix` flag

### ESLint Requirements (MUST)

When writing TypeScript/React code, ensure:

1. **No Explicit `any` Type**
   - Never use `any` - be specific with types
   - Use `unknown` when type is truly unknown and cast explicitly
   - Use union types for multiple possibilities
   - Example (❌ WRONG):
   ```tsx
   const data = response as any;
   const items = props.items as any;
   ```
   - Example (✅ CORRECT):
   ```tsx
   interface UserData {
     id: number;
     name: string;
   }
   const data = response as unknown as UserData;
   const items = props.items as Item[];
   ```

2. **Type-safe Props Casting**
   - When casting Inertia props, use `unknown` as intermediary
   - Define proper interfaces for props
   - Example:
   ```tsx
   interface PageProps {
     logs: Pagination;
     archives: Archive[];
     statistics: Statistics;
   }
   
   const { logs, archives, statistics } = usePage().props as unknown as PageProps;
   ```

3. **No Unused Variables**
   - Remove variables that are declared but never used
   - Comment out code instead of leaving unused variables
   - Example (❌ WRONG):
   ```tsx
   const result = await response.json();
   window.location.reload();
   ```
   - Example (✅ CORRECT):
   ```tsx
   await response.json();
   window.location.reload();
   ```

4. **Record Type Hints**
   - Use `Record<string, unknown>` instead of `Record<string, any>`
   - Use specific types in Record values
   - Example:
   ```tsx
   context?: Record<string, unknown>;
   level_distribution: Record<string, number>;
   ```

5. **Array Type Parameters**
   - Use specific types in array destructuring
   - Avoid `any` in map callbacks
   - Example (❌ WRONG):
   ```tsx
   .map(([level, count]: any) => { ... })
   ```
   - Example (✅ CORRECT):
   ```tsx
   .map(([level, count]: [string, number]) => { ... })
   ```

6. **Import Organization**
   - Import UI components from `@/components/ui/*`
   - Import hooks from `@/hooks/*`
   - Import layouts from `@/layouts/*`
   - Group imports: external, then internal, then UI
   - Example:
   ```tsx
   import React, { useMemo, useState } from 'react';
   import { Head, usePage } from '@inertiajs/react';
   import { Badge } from '@/components/ui/badge';
   import AppLayout from '@/layouts/app-layout';
   import { useDebounce } from '@/hooks/use-debounce';
   ```

7. **Component Props Types**
   - Define interfaces for all component props
   - Use specific types, never `any`
   - Example:
   ```tsx
   interface MyComponentProps {
     items: Item[];
     onSelect: (id: number) => void;
     isLoading?: boolean;
   }
   
   export default function MyComponent({ items, onSelect, isLoading = false }: MyComponentProps)
   ```

8. **Event Handlers**
   - Properly type event handlers
   - Don't use `any` for events
   - Example:
   ```tsx
   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
   onClick={() => handleClick()}
   onSelect={(item: Item) => processItem(item)}
   ```

### Before Submitting Code

**Always run ESLint before committing:**
```bash
npx eslint . --fix
```

**Expected output for clean code:**
No errors or warnings should appear

**If errors appear:**
1. Check for explicit `any` types - replace with proper types
2. Check for unused variables - remove or use them
3. Check Record types - use `unknown` instead of `any`
4. Check array destructuring - add type parameters
5. Run type check: `npm run type-check` or `tsc --noEmit`

### Common ESLint Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Unexpected any. Specify a different type" | Using `any` type explicitly | Replace with specific type or `unknown` |
| "is assigned a value but never used" | Unused variable declared | Remove variable or use it |
| "is defined but never used" | Unused import/function | Remove unused import or function |
| "Missing return type" | Function lacks return type annotation | Add return type: `: ReturnType` |
| "Unsafe assignment to any" | Casting to `any` without specificity | Use intermediate `unknown` cast |
| "Generic type parameter not specified" | Missing type parameter | Add `<Type>` to generic call |

## Code Formatting & Pint

### Pint Configuration

**PHP Code Formatter for Laravel**
- **Config File**: Laravel Pint uses default Laravel preset (can be customized in pint.json)
- **Command**: `./vendor/bin/pint` (formats in place)
- **Command (Test)**: `./vendor/bin/pint --test` (check without fixing)
- **Command (Parallel)**: `./vendor/bin/pint --parallel` (faster on multi-core systems)
- **Preset**: Laravel standard PSR-12 style

### Pint Requirements (MUST)

Pint automatically handles most formatting, but ensure:

1. **Code Style Compliance**
   - 4-space indentation (not tabs)
   - Line length consideration (no hard limit, but readability matters)
   - PSR-12 compliance for PHP code
   - Consistent spacing around operators

2. **Import Organization**
   - Pint automatically sorts and organizes imports
   - Group related imports together
   - Use namespaces properly

3. **Class & Method Formatting**
   - One blank line between methods
   - Proper brace placement (opening brace on same line)
   - Consistent spacing in control structures
   - Example (✅ CORRECT):
   ```php
   public function getUserData(int $userId): array
   {
       $user = User::find($userId);
       
       return $user->getData();
   }
   ```

4. **Return Type Declarations**
   - Always include return types (enforced by PHPStan)
   - Use union types for multiple return types
   - Use nullable types with `?Type`
   - Example:
   ```php
   public function find(int $id): ?User { }
   public function getData(): string|int|null { }
   ```

5. **Constructor Property Promotion**
   - Use PHP 8 constructor property promotion
   - Makes code more concise and readable
   - Example (✅ CORRECT):
   ```php
   public function __construct(
       private readonly UserRepository $repo,
       private readonly CacheService $cache,
   ) {}
   ```

6. **String Formatting**
   - Use single quotes for simple strings
   - Use double quotes for strings with interpolation
   - Avoid unnecessary string concatenation
   - Example:
   ```php
   $simple = 'This is simple';
   $interpolated = "User: {$user->name}";
   ```

### Before Submitting Code

**Always run Pint before committing:**
```bash
./vendor/bin/pint
```

**Check without fixing (for CI/CD verification):**
```bash
./vendor/bin/pint --test
```

**Use parallel mode for faster formatting:**
```bash
./vendor/bin/pint --parallel
```

**Recommended workflow:**
```bash
# Format code with Pint
./vendor/bin/pint

# Verify with PHPStan
./vendor/bin/phpstan analyze --memory-limit=2G

# Run tests
./vendor/bin/pest

# Then commit
```

### Integration with Other Tools

**Tool Chain Priority**:
1. **Pint** - PHP formatting (must run first)
2. **PHPStan** - Type checking and static analysis
3. **ESLint** - JavaScript/TypeScript formatting and linting
4. **Pest** - Test suite verification

**Complete Code Quality Check**:
```bash
# Format PHP code
./vendor/bin/pint

# Check PHP types
./vendor/bin/phpstan analyze --memory-limit=2G

# Format TypeScript/React
npx eslint . --fix

# Run tests
./vendor/bin/pest --no-coverage
```

**Expected Output**:
```
✅ Pint: PASS (code formatted)
✅ PHPStan: [OK] No errors
✅ ESLint: (no output = success)
✅ Pest: Tests passed
```

### Common Pint Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Code doesn't look formatted | Pint not run | Run `./vendor/bin/pint` |
| Tests fail after Pint | Unintended changes | Review with `--test` flag first |
| Inconsistent spacing | Missed Pint run | Add Pint to pre-commit hook |
| Line too long (>120 chars) | Readability concern | Break into multiple lines manually |
| Formatting conflicts with IDE | IDE auto-format on save | Disable IDE auto-format, use Pint |

### Why Pint Matters

✅ **Consistency**: All PHP code follows same standard  
✅ **Readability**: Uniform formatting across codebase  
✅ **Collaboration**: Team follows same rules  
✅ **CI/CD**: Can fail builds if code not formatted  
✅ **Git diffs**: Less noise from formatting changes

## Documentation Structure & Organization

### Documentation Folder Location

All project documentation should be organized in the `/docs` folder with clear category-based structure.

**Root Documentation Path**: `/docs`

### Documentation Categories & Folder Structure

```
docs/
├── log-audit/                      # Logging and audit related docs
│   ├── README_SECURITY_LOGS.md     # Security logs overview
│   ├── SECURITY_LOGS_MONTHLY_ARCHIVE.md
│   ├── CHANGES_SUMMARY.md
│   ├── IMPLEMENTATION_COMPLETE.md
│   ├── LOGS_COMPARISON_QUICK.md
│   ├── LOGS_VISUAL_COMPARISON.md
│   └── SECURITY_LOGS_ANALYSIS.md
│
├── scurity-audit/                  # Security audit related docs
│   ├── SECURITY_README.md          # Security overview
│   ├── SECURITY_INDEX.md           # Security index/table of contents
│   ├── SECURITY_SUMMARY.md
│   ├── SECURITY_ANALYSIS.md
│   ├── SECURITY_AUDIT_2025.md
│   ├── SECURITY_CHECKLIST.md
│   ├── SECURITY_IMPROVEMENTS.md
│   └── SECURITY_FIXES_IMMEDIATE.md
│
├── api/                            # API Documentation (create if needed)
│   └── endpoints.md
│
├── architecture/                   # Architecture & Design Docs (create if needed)
│   └── overview.md
│
├── guide/                          # User/Developer Guides (create if needed)
│   └── getting-started.md
│
└── troubleshooting/                # Troubleshooting & FAQ (create if needed)
    └── common-issues.md
```

### Documentation Categories Explained

#### 1. **log-audit/** - Logging & Audit Documentation
- **Purpose**: Documentation for security logs, audit trails, and logging system
- **Content Types**: 
  - Security log implementation guides
  - Monthly archival processes
  - Log analysis and comparison docs
  - Implementation summaries
- **Examples**:
  - `SECURITY_LOGS_MONTHLY_ARCHIVE.md` - How monthly archival works
  - `IMPLEMENTATION_COMPLETE.md` - Implementation overview
  - `CHANGES_SUMMARY.md` - Change tracking

#### 2. **scurity-audit/** - Security Audit Documentation
- **Purpose**: Security analysis, audits, and security-related documentation
- **Content Types**:
  - Security audit reports
  - Security analysis documents
  - Security checklists
  - Vulnerability fixes and improvements
  - Security index/navigation
- **Examples**:
  - `SECURITY_AUDIT_2025.md` - Annual security audit
  - `SECURITY_CHECKLIST.md` - Security compliance checklist
  - `SECURITY_INDEX.md` - Index of all security docs

#### 3. **api/** - API Documentation (Recommended to Create)
- **Purpose**: API endpoints, request/response examples, authentication
- **Suggested Files**:
  - `endpoints.md` - All API endpoints
  - `authentication.md` - Auth methods
  - `errors.md` - Error handling

#### 4. **architecture/** - Architecture & System Design (Recommended to Create)
- **Purpose**: System architecture, design patterns, database schema
- **Suggested Files**:
  - `overview.md` - System overview
  - `database-schema.md` - Database design
  - `design-patterns.md` - Architecture patterns

#### 5. **guide/** - User & Developer Guides (Recommended to Create)
- **Purpose**: Step-by-step guides, tutorials, onboarding
- **Suggested Files**:
  - `getting-started.md` - Quick start guide
  - `development-setup.md` - Dev environment setup
  - `deployment.md` - Deployment guide

#### 6. **troubleshooting/** - Troubleshooting & FAQ (Recommended to Create)
- **Purpose**: Common issues, solutions, and frequently asked questions
- **Suggested Files**:
  - `common-issues.md` - Problem solutions
  - `faq.md` - Frequently asked questions

### Guidelines for Adding Documentation

**When Creating New Documentation:**

1. **Choose Appropriate Category**
   - Place documentation in existing category if it fits
   - Create new category folder if needed (e.g., `docs/performance/`)
   - Category names should be lowercase, hyphen-separated

2. **File Naming Convention**
   - Use UPPERCASE_WITH_UNDERSCORES.md for document names
   - Start with context: SECURITY_*, API_*, GUIDE_*, etc.
   - Include README.md or INDEX.md for category overview

3. **Documentation Structure**
   ```markdown
   # Document Title
   
   **Last Updated**: YYYY-MM-DD
   **Category**: Folder name
   **Status**: Draft/Review/Final
   
   ## Overview
   Brief description of what this doc covers
   
   ## Table of Contents
   - Section 1
   - Section 2
   
   ## Content Sections
   ### Section 1
   Content here
   
   ### Section 2
   Content here
   
   ## Related Documents
   - [Related Doc](./path/to/related-doc.md)
   - [External Link](https://example.com)
   ```

4. **README/INDEX Pattern**
   - Each category should have a README.md or INDEX.md
   - Acts as navigation for the category
   - Lists all documents in the category with brief descriptions

5. **Cross-Referencing**
   - Link to related documents using relative paths
   - Keep documentation interconnected
   - Update links when moving or renaming files

### Commands for Documentation

**View all documentation:**
```bash
find docs -name "*.md" -type f | sort
```

**List documentation by category:**
```bash
ls -la docs/
```

**Create new documentation category:**
```bash
mkdir -p docs/new-category/
touch docs/new-category/README.md
```

### Documentation Rules (MUST FOLLOW)

1. **Location**: All documentation MUST be in `/docs` folder
2. **Organization**: Documentation MUST be organized by category
3. **Naming**: File names MUST be UPPERCASE_WITH_UNDERSCORES.md
4. **Categories**: Create category folders for logical grouping
5. **Index**: Each category SHOULD have README.md or INDEX.md
6. **Links**: Use relative paths for cross-references
7. **Updates**: Keep documentation in sync with code changes
8. **Status**: Mark document status (Draft/Review/Final) in frontmatter

### When Copilot Creates Documentation

Copilot MUST:
- ✅ Place docs in appropriate `/docs/category/` folder
- ✅ Use UPPERCASE_WITH_UNDERSCORES.md naming
- ✅ Include proper frontmatter with status and date
- ✅ Create category folder if it doesn't exist
- ✅ Create/update README.md or INDEX.md in category
- ✅ Add cross-references to related docs
- ✅ Use relative path links for references
- ✅ Follow markdown best practices</content>
<parameter name="filePath">/home/indatech/Documents/PROJECT/fullstack-laravel-react-starter/.github/copilot-instructions.md