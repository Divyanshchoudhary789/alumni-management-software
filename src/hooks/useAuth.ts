'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthContextType, UserMetadata } from '@/types/clerk';

export function useAuth(): AuthContextType & {
  isLoading: boolean;
  error: string | null;
  redirectToSignIn: () => void;
  clearError: () => void;
} {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const authUser = useMemo(() => {
    if (!user) return null;

    // Extract custom metadata
    const metadata = user.publicMetadata as UserMetadata;
    
    return {
      ...user,
      role: metadata?.role || 'alumni',
      alumniProfileId: metadata?.alumniProfileId,
    };
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await clerkSignOut();
      router.push('/sign-in');
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', err);
    }
  }, [clerkSignOut, router]);

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