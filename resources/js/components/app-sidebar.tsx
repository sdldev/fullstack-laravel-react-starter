import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type MainNavItem, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Cog,
    LayoutGrid,
    Shield,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: MainNavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'App setting',
        href: '/admin/settingsapp',
        icon: Cog,
    },
    {
        title: 'Config',
        icon: Wrench,
        subitem: [
            {
                title: 'Profile',
                href: '/settings/profile',
                icon: ArrowRight,
            },
            {
                title: 'Password',
                href: '/settings/password',
                icon: ArrowRight,
            },
            {
                title: 'Two Factor Authentication',
                href: '/settings/two-factor',
                icon: ArrowRight,
            },
            {
                title: 'Theme',
                href: '/settings/appearance',
                icon: ArrowRight,
            },
        ],
    },
    {
        title: 'Security Logs',
        icon: Shield,
        subitem: [
            {
                title: 'Audit Logs',
                href: '/admin/audit-logs',
                icon: ArrowRight,
            },
            {
                title: 'Security Logs',
                href: '/admin/security-logs',
                icon: ArrowRight,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
