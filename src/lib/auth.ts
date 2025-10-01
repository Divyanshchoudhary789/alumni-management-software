import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return userId;
}

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

export async function getUserRole(userId: string): Promise<'admin' | 'alumni'> {
  // This would typically fetch from your database
  // For now, we'll return a default role
  // In a real implementation, you'd query your user database
  return 'alumni';
}

export function isAdmin(role: string): boolean {
  return role === 'admin';
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    admin: 2,
    alumni: 1,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}
