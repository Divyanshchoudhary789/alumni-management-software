'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { notifications } from '@mantine/notifications';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireRole?: 'admin' | 'alumni';
  showNotification?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = '/sign-in',
    requireRole,
    showNotification = true,
  } = options;

  const { isLoaded, isSignedIn, user, redirectToSignIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      if (showNotification) {
        notifications.show({
          title: 'Authentication Required',
          message: 'Please sign in to access this page',
          color: 'red',
        });
      }

      if (redirectTo === '/sign-in') {
        redirectToSignIn();
      } else {
        router.push(redirectTo);
      }
      return;
    }

    if (requireRole && user?.role !== requireRole) {
      if (showNotification) {
        notifications.show({
          title: 'Access Denied',
          message: `This page requires ${requireRole} privileges`,
          color: 'red',
        });
      }
      router.push('/dashboard');
      return;
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
    requireRole,
    redirectTo,
    showNotification,
    router,
    redirectToSignIn,
  ]);

  return {
    isLoaded,
    isSignedIn,
    user,
    isAuthorized: isSignedIn && (!requireRole || user?.role === requireRole),
  };
}

export function useRequireAuth(options?: UseAuthGuardOptions) {
  return useAuthGuard({ ...options, showNotification: true });
}

export function useRequireAdmin(
  options?: Omit<UseAuthGuardOptions, 'requireRole'>
) {
  return useAuthGuard({ ...options, requireRole: 'admin' });
}

export default useAuthGuard;
