'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthContextType, UserMetadata } from '@/types/clerk';
import { authApiService, User } from '@/services/api';
import { useApi } from './useApi';

export function useAuth(): AuthContextType & {
  isLoading: boolean;
  error: string | null;
  redirectToSignIn: () => void;
  clearError: () => void;
  backendUser: User | null;
  syncUser: () => Promise<void>;
  refetchUser: () => Promise<void>;
} {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch user data from backend when authenticated
  const { data: userData, refetch: refetchBackendUser } = useApi(
    () => authApiService.getCurrentUser(),
    {
      immediate: false, // Don't fetch immediately
      showErrorNotification: false, // Don't show error notifications for auth
    }
  );

  // Update backend user when data changes
  useEffect(() => {
    if (userData) {
      setBackendUser(userData);
    }
  }, [userData]);

  // Sync user data when Clerk user changes
  useEffect(() => {
    if (isSignedIn && user && isLoaded && userLoaded) {
      refetchBackendUser();
    } else {
      setBackendUser(null);
    }
  }, [isSignedIn, user, isLoaded, userLoaded, refetchBackendUser]);

  const authUser = useMemo(() => {
    if (!user) return null;

    // Extract custom metadata
    const metadata = user.publicMetadata as UserMetadata;

    // Merge Clerk user data with backend user data
    return {
      ...user,
      role: backendUser?.role || metadata?.role || 'alumni',
      alumniProfileId: metadata?.alumniProfileId,
      backendId: backendUser?.id,
    };
  }, [user, backendUser]);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      setBackendUser(null);
      await clerkSignOut();
      router.push('/sign-in');
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', err);
    }
  }, [clerkSignOut, router]);

  const syncUser = useCallback(async () => {
    try {
      setError(null);
      await authApiService.syncUser();
      await refetchBackendUser();
    } catch (err) {
      setError('Failed to sync user data.');
      console.error('User sync error:', err);
    }
  }, [refetchBackendUser]);

  const redirectToSignIn = useCallback(() => {
    router.push('/sign-in');
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isFullyLoaded = isLoaded && userLoaded;

  return {
    user: authUser,
    isLoaded: isFullyLoaded,
    isSignedIn: isSignedIn || false,
    isLoading: !isFullyLoaded,
    error,
    signOut,
    redirectToSignIn,
    clearError,
    backendUser,
    syncUser,
    refetchUser: refetchBackendUser,
  };
}

export function useRequireAuth() {
  const auth = useAuth();

  if (!auth.isLoaded) {
    return { ...auth, isLoading: true };
  }

  if (!auth.isSignedIn) {
    throw new Error('User must be authenticated');
  }

  return { ...auth, isLoading: false };
}

export function useUserRole() {
  const { user } = useAuth();
  return user?.role || 'alumni';
}

export function useIsAdmin() {
  const role = useUserRole();
  return role === 'admin';
}
