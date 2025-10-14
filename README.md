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
- **Code Quality** - ESLint, Prettier, PHP CS Fixer (Pint)
- **Testing** - Pest PHP untuk backend testing

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

# Code quality
npm run lint            # ESLint
npm run format          # Prettier formatting
npm run types           # TypeScript type checking

# Backend
composer setup          # Full setup script
php artisan serve       # Start Laravel server
php artisan test        # Run tests
./vendor/bin/pint       # Code formatting
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
├── auth.php            # Authentication routes  
└── settings.php        # Settings routes
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
```

## 🔒 Security

Aplikasi ini telah melalui analisis keamanan komprehensif. Dokumentasi keamanan lengkap tersedia di:

- **[SECURITY_ANALYSIS.md](SECURITY_ANALYSIS.md)** - Analisis kerentanan dan penilaian risiko
- **[SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md)** - Panduan implementasi perbaikan keamanan
- **[SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)** - Checklist deployment dan best practices

### 🛡️ Fitur Keamanan Built-in

- ✅ **Two-Factor Authentication** - Laravel Fortify 2FA
- ✅ **Rate Limiting** - Login throttling (5 attempts)
- ✅ **CSRF Protection** - Laravel & Inertia built-in
- ✅ **SQL Injection Protection** - Eloquent ORM
- ✅ **XSS Protection** - React auto-escaping
- ✅ **Password Hashing** - Bcrypt (12 rounds)
- ✅ **Activity Logging** - Spatie Activity Log

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

Baca **[SECURITY_ANALYSIS.md](SECURITY_ANALYSIS.md)** untuk detail lengkap.

### 🔍 Security Audit

```bash
# Run security checks
composer audit
npm audit --audit-level=high

# Static analysis
./vendor/bin/phpstan analyse

# Run security tests
php artisan test --filter=SecurityTest
```

## 📝 Deployment

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
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

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
- **[Laravel Boost](https://laravel.com/docs/boost)** - Enhanced Laravel development experience
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Pest](https://pestphp.com/)** - An elegant PHP testing framework
- **[VS Code](https://code.visualstudio.com/)** - Code editor with excellent Laravel support
- **[GitHub Copilot](https://github.com/features/copilot)** - AI pair programmer

### UI & Icons  
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives for React
- **[Lucide](https://lucide.dev/)** - Beautiful & consistent icon toolkit
- **[Headless UI](https://headlessui.com/)** - Unstyled, accessible UI components

### Repository
Terinspirasi dari **[Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)** - Official Laravel starter kit untuk React


### INFO
Base project ini sudah digunakan oleh
- **[indatechno](https://indatechno.com/)** 
- **[santrimu](https://santrimu.com/)** 

---

**Built with ❤️ using Laravel, React, and the amazing open source community**