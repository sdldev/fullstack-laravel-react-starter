---
applyTo: '**'
---

# laravel.instructions.md — Petunjuk untuk GitHub Copilot
Tujuan: Panduan ringkas, preskriptif, dan mesin‑readable untuk GitHub Copilot saat menghasilkan atau memodifikasi kode dalam repository Laravel 12 + React + Inertia yang memakai shadcn/ui, dengan pemisahan jelas antara Admin (dashboard) dan Site (public).

Bahasa: Bahasa Indonesia (penjelasan). Kode tetap dalam bahasa Inggris.  

--------------------------------------------------------------------------------
Aturan Utama (MUST)
- Jangan generate secrets, API keys, atau file .env. Jika butuh, gunakan placeholder environment variable.
- Gunakan FormRequest untuk validasi (app/Http/Requests/*).
- Gunakan Policies/Gates untuk otorisasi dan register di AuthServiceProvider.
- Depend on abstractions: inject interfaces (app/Repositories/Contracts/*) di constructor, bind implementasi di ServiceProvider.
- Untuk operasi create/update/delete, gunakan Inertia useForm atau router.* di frontend agar CSRF dan error handling otomatis.
- Eager-load relasi pada controller/repository untuk menghindari N+1 (->with(...)).
- Jangan expose sensitive fields di props Inertia (passwords, tokens, internal paths).
- Semua icon-only buttons harus memiliki aria-label. Modal harus trap focus.

--------------------------------------------------------------------------------
Struktur & Penempatan File (Copilot harus patuhi)
Backend
- Controllers:
  - Admin: app/Http/Controllers/Admin/*
  - Site:  app/Http/Controllers/Site/*
- Requests: app/Http/Requests/*
- Models: app/Models/*
- Policies: app/Policies/*
- Repositories: app/Repositories/Contracts/* and app/Repositories/Eloquent/*
- Services: app/Services/*
- Routes:
  - Admin routes in routes/admin.php (included via RouteServiceProvider)
  - Site/public routes in routes/web.php

Frontend (Inertia + React + shadcn/ui)
- Vite entries:
  - resources/js/entries/admin.tsx
  - resources/js/entries/site.tsx
- Pages (Inertia components):
  - resources/js/pages/admin/...
  - resources/js/pages/site/...
- Shared UI/hooks/types:
  - resources/js/pages/shared/ui/*
  - resources/js/pages/shared/hooks/*
  - resources/js/pages/shared/types/*
- Blade wrappers:
  - resources/views/admin/app.blade.php  (mounts admin entry)
  - resources/views/site/app.blade.php   (mounts site entry)

Vite alias: configure '@' to point to resources/js/pages so imports use '@/shared/ui/...' etc.

--------------------------------------------------------------------------------
Code Generation Rules (detailed, MUST)
When Copilot creates a new admin resource page (example: Payments), perform all of the following in same change set:

1. Controller
   - File: app/Http/Controllers/Admin/PaymentController.php
   - Inject PaymentRepositoryInterface (or PaymentService) via constructor.
   - index(Request $request): use repo to paginateWithRelations($perPage) and return:
     Inertia::render('admin/payments/Index', ['payments' => $payments, 'users' => $users])
   - Do not include sensitive attributes in returned props.

2. Route
   - Add to routes/admin.php only. Use group with middleware auth + admin guard/middleware.
   - Example: Route::get('/payments', [PaymentController::class,'index'])->name('admin.payments.index');

3. Repository & Service (if missing)
   - Interface: app/Repositories/Contracts/PaymentRepositoryInterface.php
   - Implementation: app/Repositories/Eloquent/PaymentRepository.php
   - Service: app/Services/PaymentService.php for orchestration if needed.

4. FormRequest & Policy (if mutating or authorization needed)
   - app/Http/Requests/Admin/StorePaymentRequest.php with authorize() calling policy.
   - app/Policies/PaymentPolicy.php with view/create/update/delete methods registered in AuthServiceProvider.

5. Inertia Page (frontend)
   - File: resources/js/pages/admin/payments/Index.tsx (TSX)
   - Typed props (import types from resources/js/pages/shared/types).
   - Use shared/ui components (shadcn primitives wrappers).
   - Implement:
     - Search input with debounce (use shared hook useDebounce).
     - SSR-safe mobile detection (useIsMobile).
     - Responsive layout: card list for mobile, table for desktop.
     - Pagination rendering from paginator links (avoid dangerouslySetInnerHTML when possible; if paginator returns HTML, strip tags or sanitize).
     - Edit/Delete patterns: parent holds editingPayment & deletingPayment state; ActionDropdown triggers onEdit(id) and onRequestDelete(id) callbacks.

6. Tests
   - Create Feature test scaffold: tests/Feature/Admin/PaymentControllerTest.php verifying auth, route, and basic props shape.
   - Add Unit test skeleton for new Service/Repository if created.

7. Blade wrapper
   - Ensure resources/views/admin/app.blade.php exists to mount correct Vite entry and @inertia.

If any step cannot be completed (missing context), Copilot must ask clarifying question before making changes.

--------------------------------------------------------------------------------
Frontend patterns & UI behavior (MUST / SHOULD)
- ActionDropdown pattern:
  - If parent passes onRequestDelete(id): dropdown DELETE item must call onRequestDelete(id) (parent will open DeleteModal with detailed info).
  - If parent passes onEdit(id): dropdown EDIT must call onEdit(id) so parent can open EditModal. If onEdit not provided, fallback to href `/admin/payments/{id}/edit`.
  - If onRequestDelete not provided, dropdown should fallback to internal AlertDialog confirmation and then call onDelete(id).
- DeleteModal:
  - Parent DeleteModal shows detailed info (user name, category, formatted amount) and has confirm button which triggers Inertia delete (or calls parent-provided onConfirm).
- Accessibility:
  - Use aria-label on icon-only buttons; modal buttons have clear labels; use role attributes where relevant.
- Images:
  - Use optimized thumbnails, loading="lazy", and alt attributes.

--------------------------------------------------------------------------------
Performance & Security reminders (Copilot must surface warnings)
- Eager-load relations for lists (->with('user','paymentCategory')).
- Add DB indexes for frequently queried columns (hint in migration comments).
- Cache expensive queries using Cache::remember when business allows.
- When returning paginator labels that include HTML, warn about XSS and prefer numeric pagination or server-side sanitization.
- For destructive actions ensure policy check before delete in controller/service.

--------------------------------------------------------------------------------
Code Style, Tests & CI (MUST follow)
- PHP: PSR-12 / use laravel pint or php-cs-fixer.
- TS/TSX: ESLint + Prettier; use strict typing.
- Commit message convention: type(scope): short-description (feat|fix|chore|docs|refactor|test).
- PR description must include summary, files changed, migrations (Y/N), tests (Y/N), and local run steps.
- Add tests for important behaviors and include test command snippets in PR body.

--------------------------------------------------------------------------------
Templates Copilot should follow (short examples)

Controller skeleton (high level)
```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Models\User;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentRepositoryInterface $repo) {}

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $payments = $this->repo->paginateWithRelations($perPage);
        $users = User::select('id','full_name')->get();

        return Inertia::render('admin/payments/Index', compact('payments','users'));
    }
}
```

Inertia page skeleton (TSX)
```tsx
import React, { useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useDebounce } from '@/pages/shared/hooks/use-debounce';
import { useIsMobile } from '@/pages/shared/hooks/use-is-mobile';
import ActionDropdown from '@/pages/shared/ui/action-dropdown';

export default function Index() {
  const { payments, users } = usePage().props as any;
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    if (!s) return payments.data;
    return payments.data.filter((p: any) => /* match fields */ true);
  }, [payments.data, debounced]);

  return <div>{/* responsive table/cards + modals */}</div>;
}
```

--------------------------------------------------------------------------------
Behavioral rules for Copilot (how to behave)
- Prefer Admin placement if ambiguous for a CRUD/management resource.
- Do not change root-level config, CI, or unrelated files without explicit user request.
- When generating large multi-file changes, scaffold minimal working example + tests and describe next manual steps in the PR body.
- If uncertain about design decisions (e.g., repository method names, policy names), ask the user before committing broad changes.

--------------------------------------------------------------------------------
Failure cases & mandatory comments
- If props include sensitive fields: insert comment: `// WARNING: remove sensitive fields before sending to client`
- If using raw SQL: insert comment recommending parameterized queries or Eloquent
- If adding migration changing critical columns, add test note and rollback instructions in comment.

--------------------------------------------------------------------------------
Final note
- Use resources/js/pages (not resources/js/src). Use entries under resources/js/entries for Vite.
- This file is authoritative guidance for Copilot in this repo. If user request conflicts with these rules, ask for clarification.
