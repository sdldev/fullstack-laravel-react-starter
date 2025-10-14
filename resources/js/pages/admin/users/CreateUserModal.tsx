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
import { FormEventHandler } from 'react';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CreateUserData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    member_number: string;
    full_name: string;
    phone: string;
    join_date: string;
    is_active: boolean;
}

export default function CreateUserModal({
    isOpen,
    onClose,
}: CreateUserModalProps) {
    const { data, setData, post, processing, errors, reset } =
        useForm<CreateUserData>({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'user',
            member_number: '',
            full_name: '',
            phone: '',
            join_date: new Date().toISOString().split('T')[0],
            is_active: true,
        });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user to the system. Fill in the required
                        information below.
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
                            <Label htmlFor="password">Password *</Label>
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
                                required
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
                                Confirm Password *
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
                                required
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
                            {processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
