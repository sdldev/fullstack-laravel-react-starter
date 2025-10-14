import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    Edit,
    Hash,
    Mail,
    Phone,
    Shield,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import DeleteUserModal from './DeleteUserModal';
import EditUserModal from './EditUserModal';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    member_number: string | null;
    full_name: string | null;
    phone: string | null;
    join_date: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function ShowUserModal({
    isOpen,
    onClose,
    user,
}: ShowUserModalProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleEditUser = () => {
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = () => {
        setIsDeleteModalOpen(true);
    };

    if (!user) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {user.full_name || user.name}
                        </DialogTitle>
                        <DialogDescription>
                            User details and information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleEditUser}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteUser}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                            </Button>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserIcon className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Name:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {user.name}
                                            </span>
                                        </div>

                                        {user.full_name &&
                                            user.full_name !== user.name && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        Full Name:
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {user.full_name}
                                                    </span>
                                                </div>
                                            )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Email:
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Email Verified:
                                            </span>
                                            <Badge
                                                variant={
                                                    user.email_verified_at
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                {user.email_verified_at
                                                    ? 'Verified'
                                                    : 'Not Verified'}
                                            </Badge>
                                        </div>

                                        {user.phone && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Phone:
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                        {user.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Role & Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Role & Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Role:
                                            </span>
                                            <Badge
                                                variant={
                                                    user.role === 'admin'
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Status:
                                            </span>
                                            <Badge
                                                variant={
                                                    user.is_active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {user.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </div>

                                        {user.member_number && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Member Number:
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                        {user.member_number}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {user.join_date && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Join Date:
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                        {new Date(
                                                            user.join_date,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            User ID:
                                        </span>
                                        <p className="text-sm font-medium">
                                            #{user.id}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Created:
                                        </span>
                                        <p className="text-sm">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Last Updated:
                                        </span>
                                        <p className="text-sm">
                                            {new Date(
                                                user.updated_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleEditUser}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit User
                                    </Button>

                                    <Button variant="outline" asChild>
                                        <Link href={`mailto:${user.email}`}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Email
                                        </Link>
                                    </Button>

                                    {user.phone && (
                                        <Button variant="outline" asChild>
                                            <Link href={`tel:${user.phone}`}>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Call User
                                            </Link>
                                        </Button>
                                    )}

                                    <Separator
                                        orientation="vertical"
                                        className="h-6"
                                    />

                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteUser}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete User
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Nested Modals */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />

            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                user={user}
            />
        </>
    );
}
