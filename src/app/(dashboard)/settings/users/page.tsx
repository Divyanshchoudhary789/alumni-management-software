'use client';

import { AdminUserManagement } from '@/components/settings/AdminUserManagement';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminUserManagement />
    </ProtectedRoute>
  );
}