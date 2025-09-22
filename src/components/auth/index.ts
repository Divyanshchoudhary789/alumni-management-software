// Authentication Components
export { default as AuthProvider } from './AuthProvider';
export { default as ProtectedRoute } from './ProtectedRoute';
export { UserProfile, UserProfileMenu } from './UserProfile';
export { default as AuthLoading } from './AuthLoading';
export { default as AuthError } from './AuthError';
export { default as AuthStatus } from './AuthStatus';
export { default as OAuthCallback } from './OAuthCallback';
export { default as AuthDemo } from './AuthDemo';

// Authentication Hooks
export { useAuth } from '@/hooks/useAuth';
export { useAuthGuard, useRequireAuth, useRequireAdmin } from '@/hooks/useAuthGuard';

// Types
export type { AuthContextType, UserMetadata, ClerkUser } from '@/types/clerk';