import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}
export interface MainNavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    subitem?: SubItems[];
}

export interface SubItems {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}
export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    /**
     * Global application settings from SettingApp model
     */
    setting?: {
        nama_app?: string;
        description?: string;
        address?: string;
        email?: string;
        phone?: string;
        facebook?: string;
        instagram?: string;
        tiktok?: string;
        youtube?: string;
        image?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
