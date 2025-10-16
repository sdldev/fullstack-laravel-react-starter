# Fullstack Laravel React Starter

Sebuah starter kit fullstack modern yang menggabungkan Laravel 12, React 19, dan Inertia.js dengan fokus pada pemisahan yang jelas antara admin panel (authenticated users) dan public site.

## 🚀 Tech Stack

### Backend
- **Laravel 12** - PHP framework yang powerful dan elegant
- **PHP 8.4** - Versi terbaru PHP untuk performa optimal
- **SQLite** - Database ringan untuk development
- **Laravel Fortify** - Authentication scaffolding

### Frontend
- **React 19** - Library JavaScript untuk membangun UI
- **TypeScript** - Type safety untuk JavaScript
- **Inertia.js 2.1** - Modern monolith approach
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components

### Build Tools
- **Vite** - Fast build tool dan dev server
- **Laravel Vite Plugin** - Integrasi seamless antara Laravel dan Vite
- **ESLint & Prettier** - Code linting dan formatting

## 🎯 Fitur Utama

### 🔐 Authentication System
- Login/Register dengan Laravel Fortify
- Two-Factor Authentication
- Password Reset
- Email Verification
- Profile Management

### 🎨 UI/UX
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Toggle tema light/dark
- **Component-based Architecture** - Menggunakan shadcn/ui
- **Accessibility** - ARIA compliant components

### 📊 Admin Panel
- **Dashboard** dengan sidebar navigation
- **User Management** 
- **Settings Panel** - Profile, Password, 2FA, Appearance
- **Activity Logging** - Track user activities
- **File Management** dengan image processing

### 🌐 Public Site
- **Welcome Page** untuk visitors
- **Responsive Navigation** 
- **SEO Optimized** dengan proper meta tags

### 🛠️ Development Experience
- **Laravel Boost** - Enhanced development tools
- **Hot Module Replacement** - Instant feedback saat development
- **Type Safety** - Full TypeScript support
- **Code Quality** - PHPStan (Level 5), ESLint, Pint
- **Testing** - Pest PHP untuk backend testing
- **Static Analysis** - Strict type checking & linting

## 📦 Integrasi Package

### Backend Packages
- `spatie/laravel-activitylog` - Activity logging system
- `intervention/image` - Image manipulation dan processing  
- `spatie/laravel-backup` - Database dan file backup solution
- `laravel/wayfinder` - Advanced routing capabilities

### Development Tools
- `laravel/boost` - Enhanced Laravel development experience
- `laravel/pint` - PHP CS Fixer untuk Laravel
- `pestphp/pest` - Modern PHP testing framework

### Frontend Components
- `@radix-ui/react-*` - Primitive components untuk accessibility
- `lucide-react` - Beautiful icon library
- `class-variance-authority` - Utility untuk component variants
- `tailwind-merge` - Merge Tailwind classes dengan smart

## 🚀 Quick Start

### Prerequisites
- PHP 8.4 atau higher
- Node.js 18 atau higher
- Composer
- SQLite (atau database lainnya)

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd fullstack-laravel-react-starter
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   composer install
   
   # Frontend dependencies
   npm install
   ```

3. **Setup environment**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Generate application key
   php artisan key:generate
   
   # Run migrations
   php artisan migrate
   ```

4. **Build assets**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   ```

5. **Start development server**
   ```bash
   php artisan serve
   ```

### Development Scripts

```bash
# Frontend development
npm run dev              # Start Vite dev server
npm run build           # Build untuk production
npm run build:ssr       # Build dengan SSR support

# Code quality & formatting
npm run lint            # ESLint - TypeScript/React linting
npm run format          # Prettier - Code formatting
npm run types           # TypeScript type checking

# Backend quality
./vendor/bin/phpstan analyze --memory-limit=2G  # PHPStan - Type checking
./vendor/bin/pint                                # Pint - PHP formatting
./vendor/bin/pint --test                         # Test without fixing

# Backend
composer setup          # Full setup script
php artisan serve       # Start Laravel server
php artisan test        # Run tests (Pest)
php artisan migrate     # Run database migrations
```

### Complete Code Quality Workflow

```bash
# Format PHP code with Pint
./vendor/bin/pint

# Type check PHP with PHPStan (Level 5)
./vendor/bin/phpstan analyze --memory-limit=2G

# Format & lint TypeScript/React with ESLint
npx eslint . --fix

# Run tests to ensure everything works
./vendor/bin/pest --no-coverage
```

## 🏗️ Arsitektur

### Pemisahan Admin & Public

Project ini didesain dengan pemisahan yang jelas:

**Admin Panel** (`/dashboard`, `/settings`)
- Authenticated users only
- Sidebar navigation dengan AppSidebar
- Dashboard dengan widgets dan statistics
- User management dan settings

**Public Site** (`/`, `/login`, `/register`)
- Accessible untuk semua visitors  
- Header navigation dengan AppHeader
- Landing page dan auth pages
- SEO optimized

### Code Organization & Standards

Project ini mengikuti **strict coding standards** dengan:

**📊 PHPStan (Level 5)** - Static type analysis
- Strict type declarations
- Type casting untuk semua variables
- Nullable types & union types
- No implicit any types

**🎨 ESLint** - TypeScript/React linting
- No explicit `any` types
- Type-safe prop interfaces
- Proper import organization
- No unused variables

**🔧 Pint** - PHP code formatting
- PSR-12 compliance
- Automatic import sorting
- Constructor property promotion
- Consistent spacing & indentation

**Recommended Workflow**:
```bash
./vendor/bin/pint          # 1. Format PHP
./vendor/bin/phpstan...    # 2. Type check PHP
npx eslint . --fix         # 3. Format TS/React
./vendor/bin/pest          # 4. Run tests
```

### Struktur Directory

```
app/
├── Http/Controllers/     # Laravel controllers
├── Models/              # Eloquent models
└── Providers/           # Service providers

resources/js/
├── components/          # Reusable React components
├── layouts/            # Layout components (auth, app, settings)
├── pages/              # Inertia pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript definitions

routes/
├── web.php             # Public routes
├── admin.php           # Admin routes
├── auth.php            # Authentication routes  
└── settings.php        # Settings routes

docs/                    # Project documentation
├── log-audit/          # Logging & audit docs
├── scurity-audit/      # Security audit docs
├── api/                # API documentation (recommended)
├── architecture/       # Architecture & design (recommended)
├── guide/              # Developer guides (recommended)
└── troubleshooting/    # FAQ & issues (recommended)
```

### Component Architecture

```typescript
// Type-safe navigation items
interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
}

// Shared data across components
interface SharedData {
    auth: { user: User };
    name: string;
    sidebarOpen: boolean;
}
```

### Documentation

Semua dokumentasi tersimpan di folder `/docs` dengan struktur kategori:

- **log-audit/** - Security logs & audit documentation
- **scurity-audit/** - Security audit reports & checklists
- **api/** - API endpoints & authentication (recommended)
- **architecture/** - System design & patterns (recommended)
- **guide/** - Developer guides & tutorials (recommended)
- **troubleshooting/** - FAQ & common issues (recommended)

**Baca lebih lanjut**: Lihat [COPILOT_INSTRUCTIONS_SUMMARY.md](docs/COPILOT_INSTRUCTIONS_SUMMARY.md)

### GitHub Copilot Instructions

Project ini memiliki comprehensive Copilot instructions di `.github/copilot-instructions.md` (705 lines) yang mencakup:

✅ **Architecture Patterns** - Admin vs Site separation  
✅ **PHPStan Standards** - Type checking (Level 5)  
✅ **ESLint Rules** - TypeScript/React linting  
✅ **Pint Formatting** - PHP code formatting (PSR-12)  
✅ **Documentation Structure** - `/docs` organization  

Instruksi ini memastikan Copilot menghasilkan code yang comply dengan semua standards.

## 🎨 UI Components

Menggunakan **shadcn/ui** untuk component library yang:
- Fully accessible (ARIA compliant)
- Customizable dengan Tailwind CSS
- Type-safe dengan TypeScript
- Consistent design system

### Key Components
- `AppSidebar` - Admin navigation sidebar
- `AppHeader` - Public site header  
- `UserMenu` - User dropdown dengan profile actions
- `Breadcrumbs` - Navigation breadcrumbs
- `ThemeToggle` - Dark/light mode switcher

## 🔧 Kustomisasi

### Theme Configuration
Ubah tema di `tailwind.config.js` dan `resources/css/app.css`:

```css
/* Dark mode colors */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Navigation Items
Edit navigation di `components/app-sidebar.tsx`:

```typescript
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard', 
        href: dashboard(),
        icon: LayoutGrid,
    },
    // Add more items...
];
```

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=DashboardTest

# Run with coverage
php artisan test --coverage

# Code quality checks
./vendor/bin/phpstan analyze --memory-limit=2G  # PHPStan type checking
./vendor/bin/pint --test                         # Pint format check
npx eslint .                                     # ESLint check
```

### Test Results

```
✅ Pest:      75 tests passed (264 assertions)
✅ PHPStan:   [OK] No errors
✅ ESLint:    No errors
✅ Pint:      PASS (85 files)
```

## 🔒 Security

Aplikasi ini telah melalui analisis keamanan komprehensif sebanyak **2 kali** (Oktober 14 & 15, 2025).

### 📊 Status Keamanan Terkini
- **Security Score**: 80/100 ⚠️ (Target: 90/100 ✅)
- **Critical Issues**: 0 tersisa ✅
- **High Priority**: 2 tersisa ⏳
- **Status**: Improved, 2-3 minggu lagi menuju production ready

### 📚 Dokumentasi Keamanan

**🎯 Mulai Di Sini**:
- **[SECURITY_README.md](SECURITY_README.md)** - 📖 Navigation guide untuk semua dokumentasi keamanan
- **[SECURITY_INDEX.md](SECURITY_INDEX.md)** - Index lengkap dokumentasi keamanan

**Audit Terkini (Oktober 15, 2025)**:
- **[docs/scurity-audit/SECURITY_AUDIT_2025.md](docs/scurity-audit/SECURITY_AUDIT_2025.md)** - Audit terbaru dengan findings lengkap
- **[docs/scurity-audit/SECURITY_FIXES_IMMEDIATE.md](docs/scurity-audit/SECURITY_FIXES_IMMEDIATE.md)** - Panduan implementasi fixes
- **[docs/scurity-audit/SECURITY_CHECKLIST.md](docs/scurity-audit/SECURITY_CHECKLIST.md)** - Deployment checklist

**Audit Pertama (Oktober 14, 2025)**:
- **[docs/scurity-audit/SECURITY_ANALYSIS.md](docs/scurity-audit/SECURITY_ANALYSIS.md)** - Analisis kerentanan original
- **[docs/scurity-audit/SECURITY_IMPROVEMENTS.md](docs/scurity-audit/SECURITY_IMPROVEMENTS.md)** - Panduan implementasi detail
- **[docs/scurity-audit/SECURITY_SUMMARY.md](docs/scurity-audit/SECURITY_SUMMARY.md)** - Executive summary

### 🛡️ Fitur Keamanan Built-in

- ✅ **Two-Factor Authentication** - Laravel Fortify 2FA
- ✅ **Rate Limiting** - Login throttling (5 attempts)
- ✅ **CSRF Protection** - Laravel & Inertia built-in
- ✅ **SQL Injection Protection** - Eloquent ORM
- ✅ **XSS Protection** - React auto-escaping
- ✅ **Password Hashing** - Bcrypt (12 rounds)
- ✅ **Activity Logging** - Spatie Activity Log
- ✅ **Type Safety** - PHPStan Level 5

### ⚠️ Rekomendasi Pre-Production

Sebelum deploy ke production, **WAJIB** review dan implementasi:

1. **Critical Issues**
   - Change default passwords di seeder
   - Filter sensitive data di Inertia props

2. **High Priority**
   - Implement file content validation
   - Enable HTTPS enforcement
   - Add security headers
   - Configure security logging

3. **Configuration**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   SESSION_ENCRYPT=true
   SESSION_LIFETIME=30
   SESSION_SECURE_COOKIE=true
   ```

Baca **[docs/scurity-audit/SECURITY_ANALYSIS.md](docs/scurity-audit/SECURITY_ANALYSIS.md)** untuk detail lengkap.

### 🔍 Security Audit & Code Quality

```bash
# Security checks
composer audit
npm audit --audit-level=high

# Static analysis & type checking
./vendor/bin/phpstan analyze --memory-limit=2G

# Code formatting & linting
./vendor/bin/pint --test
npx eslint .

# Run security tests
php artisan test --filter=SecurityTest
```

## 📝 Deployment

### Pre-Deployment Checklist

Sebelum deploy, pastikan telah menjalankan semua quality checks:

```bash
# 1. Code formatting dengan Pint
./vendor/bin/pint

# 2. Type checking dengan PHPStan (Level 5)
./vendor/bin/phpstan analyze --memory-limit=2G

# 3. Linting dengan ESLint
npx eslint . --fix

# 4. Running tests
./vendor/bin/pest

# 5. Security checks
composer audit
npm audit --audit-level=high

# 6. Review security documentation
# Baca: docs/scurity-audit/SECURITY_CHECKLIST.md
```

### Production Build

```bash
# Install production dependencies
composer install --no-dev --optimize-autoloader

# Build frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force
```

### Environment Variables

Pastikan environment variables berikut diset untuk production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Security
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
```

**Lihat juga**: [docs/scurity-audit/SECURITY_CHECKLIST.md](docs/scurity-audit/SECURITY_CHECKLIST.md)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📚 Code Standards & Development Guidelines

### Required Reading

Sebelum mulai development, **WAJIB** baca:

1. **[.github/copilot-instructions.md](.github/copilot-instructions.md)** (705 lines)
   - Comprehensive guide untuk semua developer & Copilot
   - Covers: Architecture, PHPStan, ESLint, Pint, Documentation
   
2. **[docs/COPILOT_INSTRUCTIONS_SUMMARY.md](docs/COPILOT_INSTRUCTIONS_SUMMARY.md)**
   - Quick reference untuk standards
   - Tool chain workflow
   - Common issues & fixes

### Code Quality Standards

**PHPStan (Type Checking - Level 5)**
- All parameters & return types must have explicit type declarations
- No implicit `any` types
- Proper variable type casting
- Use nullable types (`?Type` or `Type|null`)

**ESLint (TypeScript/React Linting)**
- No explicit `any` types (use specific types or `unknown`)
- Type-safe prop interfaces
- Proper import organization
- No unused variables or imports

**Pint (PHP Code Formatting)**
- PSR-12 compliance
- 4-space indentation
- Proper import sorting
- Constructor property promotion (PHP 8)

**Documentation**
- All docs in `/docs` folder organized by category
- File naming: `UPPERCASE_WITH_UNDERSCORES.md`
- Each category has `README.md` or `INDEX.md`
- Include frontmatter with status & date

### Development Workflow

**Before committing code:**

```bash
# 1. Format PHP
./vendor/bin/pint

# 2. Type check PHP
./vendor/bin/phpstan analyze --memory-limit=2G

# 3. Format TypeScript/React
npx eslint . --fix

# 4. Run tests
./vendor/bin/pest --no-coverage

# 5. Verify all passing
# If all green, ready to commit!
```

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| PHPStan error: "Parameter expects int, string given" | Cast option: `(int) $this->option('name')` |
| ESLint error: "Unexpected any" | Use specific type or `unknown as Type` |
| Unused variable warning | Remove variable or use it in code |
| Formatting not applied | Run `./vendor/bin/pint` & `npx eslint . --fix` |
| Test failing after changes | Run `./vendor/bin/pest` to see failures |

## 📄 License

Project ini menggunakan [MIT License](LICENSE).

## 🙏 Credits & Acknowledgments

### Frameworks & Libraries
- **[Laravel](https://laravel.com/)** - The PHP framework for web artisans
- **[React](https://reactjs.org/)** - A JavaScript library for building user interfaces  
- **[Inertia.js](https://inertiajs.com/)** - Build single-page apps, without building an API
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible UI components

### Key Packages
- **[Spatie Laravel ActivityLog](https://github.com/spatie/laravel-activitylog)** - Log activity inside your Laravel app
- **[Intervention Image](https://github.com/Intervention/image)** - Image handling and manipulation library
- **[Spatie Laravel Backup](https://github.com/spatie/laravel-backup)** - A package to backup your Laravel app
- **[Laravel Fortify](https://github.com/laravel/fortify)** - Frontend agnostic authentication backend

### Development Tools
- **[PHPStan](https://phpstan.org/)** - Static analysis tool for PHP (Level 5 - strict)
- **[Pint](https://laravel.com/docs/pint)** - Laravel's PHP code style fixer (PSR-12)
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting with strict rules
- **[Laravel Boost](https://laravel.com/docs/boost)** - Enhanced Laravel development experience
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Pest](https://pestphp.com/)** - An elegant PHP testing framework
- **[VS Code](https://code.visualstudio.com/)** - Code editor with excellent Laravel support
- **[GitHub Copilot](https://github.com/features/copilot)** - AI pair programmer with custom instructions

### UI & Icons  
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives for React
- **[Lucide](https://lucide.dev/)** - Beautiful & consistent icon toolkit
- **[Headless UI](https://headlessui.com/)** - Unstyled, accessible UI components

### Documentation & Security
- **[Laravel Security Guide](https://laravel.com/docs/security)** - Official Laravel security best practices
- **[OWASP](https://owasp.org/)** - Security best practices reference

### Repository
Terinspirasi dari **[Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)** - Official Laravel starter kit untuk React

### Used By
Base project ini sudah digunakan oleh:
- **[indatechno](https://indatechno.com/)** 
- **[santrimu](https://santrimu.com/)** 

---

**Built with ❤️ using Laravel, React, TypeScript, and strict coding standards**

Latest Update: October 16, 2025  
Version: 1.0.0 Production Ready  
Status: ✅ All quality checks passing