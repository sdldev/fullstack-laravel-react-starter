import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Activity, Settings, TrendingUp, Users } from 'lucide-react';

interface AdminDashboardProps {
    breadcrumbs: Array<{
        title: string;
        href: string;
    }>;
}

export default function AdminDashboard({ breadcrumbs }: AdminDashboardProps) {
    const stats = [
        {
            title: 'Total Users',
            value: '1,234',
            icon: Users,
            change: '+12%',
            changeType: 'positive',
        },
        {
            title: 'Active Sessions',
            value: '89',
            icon: Activity,
            change: '+5%',
            changeType: 'positive',
        },
        {
            title: 'System Health',
            value: '99.9%',
            icon: TrendingUp,
            change: '0%',
            changeType: 'neutral',
        },
        {
            title: 'Settings Updated',
            value: '23',
            icon: Settings,
            change: '+3',
            changeType: 'positive',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome to the admin panel. Monitor and manage your
                        application from here.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <span
                                        className={`${
                                            stat.changeType === 'positive'
                                                ? 'text-green-600'
                                                : stat.changeType === 'negative'
                                                  ? 'text-red-600'
                                                  : 'text-muted-foreground'
                                        }`}
                                    >
                                        {stat.change}
                                    </span>{' '}
                                    from last month
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                                Analytics Chart Placeholder
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            New user registered
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            2 minutes ago
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-3 h-2 w-2 rounded-full bg-green-600"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            System backup completed
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            1 hour ago
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-3 h-2 w-2 rounded-full bg-yellow-600"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            Settings updated
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            3 hours ago
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
