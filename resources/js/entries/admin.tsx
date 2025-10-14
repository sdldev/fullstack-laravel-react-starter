import '../../css/app.css';

import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from '../hooks/use-appearance';
import { initializeThemeCustomization } from '../hooks/use-theme-customization';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
// Admin loading component
const AdminLoader = () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
        <div className="text-center">
            <div className="relative">
                <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400"></div>
                <div className="absolute top-3 left-3 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-indigo-300 dark:border-t-indigo-500"></div>
            </div>
            <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">
                Loading Admin Panel...
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please wait while we prepare your dashboard
            </p>
        </div>
    </div>
);

createInertiaApp({
    title: (title) =>
        title ? `${title} - Admin - ${appName}` : `Admin - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `../pages/${name}.tsx`,
            import.meta.glob('../pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // root.render(<App {...props} />
        root.render(
            <Suspense fallback={<AdminLoader />}>
                <App {...props} />
                <Toaster richColors position="bottom-center" />
            </Suspense>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Initialize theme on load
initializeTheme();
initializeThemeCustomization();
