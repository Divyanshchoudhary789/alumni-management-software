import { auth, currentUser } from '@clerk/nextjs/server';
import { User } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authErrorMessages, getRedirectUrl } from './config';

// Server-side authentication utilities
export async function getAuthUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const role = user.publicMetadata?.role as string;
  
  if (role !== 'admin') {
    redirect('/dashboard?error=unauthorized');
  }
  
  return user;
}

export async function getUserRole(user?: User | null): Promise<'admin' | 'alumni'> {
  if (!user) {
    const authUser = await getAuthUser();
    if (!authUser) return 'alumni';
    user = authUser;
  }
  
  return (user.publicMetadata?.role as 'admin' | 'alumni') || 'alumni';
}

export async function checkPermission(
  requiredRole: 'admin' | 'alumni',
  user?: User | null
): Promise<boolean> {
  const userRole = await getUserRole(user);
  
  if (requiredRole === 'admin') {
    return userRole === 'admin';
  }
  
  return true; // Alumni role can access alumni features
}

// Client-side utilities
export function getAuthErrorMessage(errorCode?: string): string {
  if (!errorCode) return authErrorMessages.default;
  return authErrorMessages[errorCode as keyof typeof authErrorMessages] || authErrorMessages.default;
}

export function buildAuthRedirectUrl(
  baseUrl: string,
  params?: Record<string, string>
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

export function parseAuthError(searchParams: URLSearchParams) {
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  return {
    hasError: !!error,
    errorCode: error,
    errorMessage: getAuthErrorMessage(error || undefined),
    errorDescription,
  };
}

// User metadata helpers
export function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>
) {
  // This would typically call the Clerk API to update user metadata
  // For now, we'll return a promise that resolves
  return Promise.resolve();
}

export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.username) {
    return user.username;
  }
  
  return user.emailAddresses[0]?.emailAddress || 'User';
}

export function getUserInitials(user: User): string {
  const displayName = getUserDisplayName(user);
  const names = displayName.split(' ');
  
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  
  return displayName.slice(0, 2).toUpperCase();
}

// OAuth provider helpers
export function getOAuthProviderIcon(provider: string): string {
  switch (provider) {
    case 'oauth_google':
      return '🔍'; // You can replace with actual icons
    case 'oauth_linkedin_oidc':
      return '💼';
    default:
      return '🔐';
  }
}

export function getOAuthProviderName(provider: string): string {
  switch (provider) {
    case 'oauth_google':
      return 'Google';
    case 'oauth_linkedin_oidc':
      return 'LinkedIn';
    default:
      return 'OAuth Provider';
  }
}

// Session helpers
export function isSessionExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false;
  return Date.now() > expiresAt * 1000;
}

export function getSessionTimeRemaining(expiresAt?: number): number {
  if (!expiresAt) return 0;
  const remaining = (expiresAt * 1000) - Date.now();
  return Math.max(0, remaining);
}

export function formatSessionTimeRemaining(expiresAt?: number): string {
  const remaining = getSessionTimeRemaining(expiresAt);
  const minutes = Math.floor(remaining / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  return `${minutes}m`;
}