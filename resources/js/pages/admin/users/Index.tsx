import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
}

interface UsersIndexProps {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
  };
  breadcrumbs: Array<{
    title: string;
    href: string;
  }>;
}

export default function Index({ users, breadcrumbs }: UsersIndexProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users Management" />
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          </div>
          <Button asChild>
            <Link href="/admin/users/create">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Member #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.full_name || user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.member_number || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'outline'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.join_date ? new Date(user.join_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/admin/users/${user.id}`}
                            method="delete"
                            as="button"
                            onClick={(e) => {
                              if (!confirm('Are you sure you want to delete this user?')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

        {/* Pagination */}
        {users.last_page > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={users.prev_page_url || '#'}
                  className={users.current_page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: users.last_page }, (_, i) => i + 1)
                .filter(page => {
                  const current = users.current_page;
                  // Show first page, last page, current page, and pages around current
                  return page === 1 ||
                         page === users.last_page ||
                         (page >= current - 1 && page <= current + 1);
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1];
                  if (prevPage && page - prevPage > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href={`/admin/users?page=${page}`}
                            isActive={page === users.current_page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`/admin/users?page=${page}`}
                        isActive={page === users.current_page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

              <PaginationItem>
                <PaginationNext
                  href={users.next_page_url || '#'}
                  className={users.current_page === users.last_page ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AppLayout>
  );
}