# Toast Notifications Usage Guide

## Overview
This application uses [Sonner](https://sonner.emilkowal.ski/) for displaying toast notifications. The toaster component is already mounted in `resources/js/entries/admin.tsx`.

## Backend - Flash Messages

Controllers can send flash messages that will automatically be displayed as toasts:

```php
// In your controller
return redirect()->route('admin.users.index')
    ->with('success', 'User created successfully.');

// Available flash types:
->with('success', 'Operation completed successfully')
->with('error', 'An error occurred')
->with('info', 'Here is some information')
->with('warning', 'Please be careful')
```

These flash messages are shared to all Inertia pages via `HandleInertiaRequests` middleware.

## Frontend - Automatic Toast Display

Use the `useFlashMessages()` hook to automatically display toasts from backend flash messages:

```tsx
import { useFlashMessages } from '@/hooks/use-flash-messages';

export default function MyPage() {
    useFlashMessages(); // Automatically shows toasts from flash messages
    
    return (
        <div>
            {/* Your page content */}
        </div>
    );
}
```

## Frontend - Manual Toast Display

You can also trigger toasts manually using the `toast` API from Sonner:

```tsx
import { toast } from 'sonner';

// Success toast (green)
toast.success('User created successfully');

// Error toast (red)
toast.error('Failed to create user');

// Info toast (blue)
toast.info('Processing your request');

// Warning toast (yellow)
toast.warning('This action cannot be undone');

// Loading toast (with spinner)
toast.loading('Saving changes...');

// Promise-based toast (auto-updates on resolve/reject)
toast.promise(
    saveUserData(),
    {
        loading: 'Saving...',
        success: 'Saved successfully!',
        error: 'Failed to save'
    }
);
```

## Example: User Management Implementation

The user management pages demonstrate both approaches:

### 1. Index Page (Automatic)
```tsx
export default function Index({ users, breadcrumbs }) {
    useFlashMessages(); // Shows toasts when redirected from create/update/delete
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Page content */}
        </AppLayout>
    );
}
```

### 2. Modal Actions (Manual)
```tsx
const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/users', {
        onSuccess: () => {
            reset();
            onClose();
            toast.success('User created successfully');
        },
        onError: () => {
            toast.error('Failed to create user. Please check the form.');
        },
        preserveScroll: true,
    });
};
```

## Toast Configuration

The Toaster component is configured in `resources/js/entries/admin.tsx`:

```tsx
<Toaster richColors position="bottom-center" />
```

You can customize the position and other options:
- **position**: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`
- **richColors**: Use predefined colors for each toast type
- **expand**: Auto-expand when multiple toasts are shown
- **duration**: How long toasts remain visible (default: 4000ms)

## Best Practices

1. **Use automatic toasts for redirects**: When redirecting after an action, use backend flash messages
2. **Use manual toasts for AJAX operations**: For operations that don't redirect, use manual `toast()` calls
3. **Provide clear messages**: Make toast messages descriptive and actionable
4. **Don't overuse**: Only show toasts for important feedback
5. **Consider toast duration**: Longer messages may need longer duration

## Examples by Scenario

### Creating a resource
```php
// Backend
User::create($data);
return redirect()->route('admin.users.index')
    ->with('success', 'User created successfully.');
```

### Updating a resource
```tsx
// Frontend
put(`/admin/users/${user.id}`, {
    onSuccess: () => {
        toast.success('User updated successfully');
        onClose();
    },
    onError: () => {
        toast.error('Failed to update user');
    }
});
```

### Deleting a resource with confirmation
```tsx
router.delete(`/admin/users/${user.id}`, {
    onSuccess: () => {
        toast.success('User deleted successfully');
        onClose();
    },
    onError: () => {
        toast.error('Failed to delete user');
    }
});
```

### Validation errors
```tsx
post('/admin/users', {
    onError: (errors) => {
        // Inertia will show inline field errors automatically
        // Optionally show a summary toast
        if (Object.keys(errors).length > 0) {
            toast.error('Please check the form for errors');
        }
    }
});
```
