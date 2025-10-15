import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    member_number: string | null;
    full_name: string | null;
    phone: string | null;
    address: string | null;
    join_date: string | null;
    note: string | null;
    is_active: boolean;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

interface EditUserData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    member_number: string;
    full_name: string;
    phone: string;
    address: string;
    join_date: string;
    note: string;
    is_active: boolean;
}

export default function EditUserModal({
    isOpen,
    onClose,
    user,
}: EditUserModalProps) {
    const { data, setData, put, processing, errors, reset } =
        useForm<EditUserData>({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user',
            member_number: '',
            full_name: '',
            phone: '',
            address: '',
            join_date: '',
            note: '',
            is_active: true,
        });

    useEffect(() => {
        if (user && isOpen) {
            // Helper: extract YYYY-MM-DD from various possible date/time formats
            const extractDate = (raw: string | null | undefined) => {
                if (!raw) return new Date().toISOString().split('T')[0];
                // Prefer explicit YYYY-MM-DD if present
                const match = raw.match(/\d{4}-\d{2}-\d{2}/);
                if (match) return match[0];
                // Fallback: try Date parse and format to YYYY-MM-DD
                const d = new Date(raw);
                if (!isNaN(d.getTime())) {
                    return d.toISOString().split('T')[0];
                }
                // Last resort: empty string so input stays blank
                return '';
            };

            setData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                role: user.role,
                member_number: user.member_number || '',
                full_name: user.full_name || '',
                phone: user.phone || '',
                address: user.address || '',
                join_date: extractDate(user.join_date),
                note: user.note || '',
                is_active: user.is_active,
            });
        }
    }, [user, isOpen, setData]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!user) return;

        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                toast.success('User berhasil diperbarui!');
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Failed to update user. Please check the form.');
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleClose();
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user information. Leave password fields empty to
                        keep the current password.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                aria-invalid={errors.name ? 'true' : 'false'}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                aria-invalid={errors.email ? 'true' : 'false'}
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                New Password
                                <span className="ml-1 text-xs text-muted-foreground">
                                    (leave empty to keep current)
                                </span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                aria-invalid={
                                    errors.password ? 'true' : 'false'
                                }
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirm New Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                aria-invalid={
                                    errors.password_confirmation
                                        ? 'true'
                                        : 'false'
                                }
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-destructive">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) =>
                                    setData('role', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-destructive">
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* Member Number */}
                        <div className="space-y-2">
                            <Label htmlFor="member_number">Member Number</Label>
                            <Input
                                id="member_number"
                                value={data.member_number}
                                onChange={(e) =>
                                    setData('member_number', e.target.value)
                                }
                                aria-invalid={
                                    errors.member_number ? 'true' : 'false'
                                }
                            />
                            {errors.member_number && (
                                <p className="text-sm text-destructive">
                                    {errors.member_number}
                                </p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                value={data.full_name}
                                onChange={(e) =>
                                    setData('full_name', e.target.value)
                                }
                                aria-invalid={
                                    errors.full_name ? 'true' : 'false'
                                }
                            />
                            {errors.full_name && (
                                <p className="text-sm text-destructive">
                                    {errors.full_name}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                aria-invalid={errors.phone ? 'true' : 'false'}
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                aria-invalid={errors.address ? 'true' : 'false'}
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        {/* Note */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="note">Note</Label>
                            <Input
                                id="note"
                                value={data.note}
                                onChange={(e) =>
                                    setData('note', e.target.value)
                                }
                                aria-invalid={errors.note ? 'true' : 'false'}
                            />
                            {errors.note && (
                                <p className="text-sm text-destructive">
                                    {errors.note}
                                </p>
                            )}
                        </div>

                        {/* Join Date */}
                        <div className="space-y-2">
                            <Label htmlFor="join_date">Join Date</Label>
                            <Input
                                id="join_date"
                                type="date"
                                value={data.join_date}
                                onChange={(e) =>
                                    setData('join_date', e.target.value)
                                }
                                aria-invalid={
                                    errors.join_date ? 'true' : 'false'
                                }
                            />
                            {errors.join_date && (
                                <p className="text-sm text-destructive">
                                    {errors.join_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked as boolean)
                            }
                        />
                        <Label htmlFor="is_active">Active user</Label>
                        {errors.is_active && (
                            <p className="text-sm text-destructive">
                                {errors.is_active}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
