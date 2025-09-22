# Authentication System

This directory contains all authentication-related components and utilities for the Alumni Management Dashboard.

## Overview

The authentication system is built using [Clerk](https://clerk.com/) with support for:
- Email/password authentication
- Google OAuth
- LinkedIn OAuth
- Protected routes
- Role-based access control
- Comprehensive error handling
- Loading states

## Components

### Core Components

#### `AuthProvider`
Wraps the entire application with Clerk's authentication context and configuration.

```tsx
import { AuthProvider } from '@/components/auth';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

#### `ProtectedRoute`
Wrapper component that ensures users are authenticated before accessing protected content.

```tsx
import { ProtectedRoute } from '@/components/auth';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
```

#### `UserProfile`
Displays user information and provides access to user actions.

```tsx
import { UserProfile } from '@/components/auth';

export function Header() {
  return (
    <header>
      <UserProfile />
    </header>
  );
}
```

### UI Components

#### `AuthLoading`
Loading skeleton for authentication states.

#### `AuthError`
Error display component with retry functionality.

#### `AuthStatus`
Status indicator showing current authentication state.

#### `OAuthCallback`
Handles OAuth callback flows with proper error handling.

## Hooks

### `useAuth()`
Primary authentication hook providing user state and actions.

```tsx
import { useAuth } from '@/components/auth';

function MyComponent() {
  const { user, isLoaded, isSignedIn, signOut, error } = useAuth();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.firstName}!</div>;
}
```

### `useAuthGuard()`
Hook for protecting components that require authentication.

```tsx
import { useAuthGuard } from '@/components/auth';

function AdminComponent() {
  const { isAuthorized } = useAuthGuard({ 
    requireRole: 'admin',
    redirectTo: '/dashboard' 
  });
  
  if (!isAuthorized) return null;
  
  return <div>Admin content</div>;
}
```

### `useRequireAuth()`
Simplified hook that automatically redirects unauthenticated users.

```tsx
import { useRequireAuth } from '@/components/auth';

function ProtectedComponent() {
  const { user } = useRequireAuth();
  
  return <div>Hello, {user.firstName}!</div>;
}
```

### `useRequireAdmin()`
Hook that requires admin role access.

```tsx
import { useRequireAdmin } from '@/components/auth';

function AdminOnlyComponent() {
  const { user } = useRequireAdmin();
  
  return <div>Admin: {user.firstName}</div>;
}
```

## Pages

### Sign In (`/sign-in`)
- Email/password authentication
- Google OAuth button
- LinkedIn OAuth button
- Link to sign up page
- Error handling for failed attempts

### Sign Up (`/sign-up`)
- Account creation form
- OAuth provider options
- Email verification flow
- Automatic redirect after successful registration

### OAuth Callback (`/oauth-callback`)
- Handles OAuth provider callbacks
- Error handling for failed OAuth flows
- Loading states during authentication
- Automatic redirect to dashboard

## Configuration

### Environment Variables

Required environment variables for Clerk:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### OAuth Providers

To enable OAuth providers, configure them in your Clerk dashboard:

1. **Google OAuth**:
   - Enable Google provider in Clerk dashboard
   - Configure OAuth consent screen
   - Add authorized redirect URIs

2. **LinkedIn OAuth**:
   - Enable LinkedIn provider in Clerk dashboard
   - Configure LinkedIn app settings
   - Add authorized redirect URIs

### Middleware Configuration

The middleware protects routes and handles authentication:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/alumni(.*)',
  // ... other protected routes
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});
```

## Error Handling

The authentication system includes comprehensive error handling:

- **Network errors**: Retry mechanisms and user feedback
- **OAuth errors**: Specific error messages for different OAuth failures
- **Session errors**: Automatic token refresh and re-authentication
- **Permission errors**: Clear messaging for insufficient permissions

## Loading States

All authentication components include proper loading states:

- Skeleton loaders for user profiles
- Loading spinners for authentication checks
- Progressive loading for OAuth flows
- Smooth transitions between states

## Security Features

- **Protected routes**: Automatic redirection for unauthenticated users
- **Role-based access**: Admin and alumni role separation
- **Session management**: Secure token handling via Clerk
- **CSRF protection**: Built-in protection against cross-site attacks
- **Secure redirects**: Validation of redirect URLs

## Testing

The authentication system includes comprehensive tests:

```bash
# Run authentication tests
npm test src/components/auth

# Run specific test file
npm test auth-components.test.tsx
```

## Troubleshooting

### Common Issues

1. **OAuth not working**:
   - Check environment variables
   - Verify OAuth provider configuration in Clerk dashboard
   - Ensure redirect URIs are correctly configured

2. **Protected routes not working**:
   - Verify middleware configuration
   - Check route patterns in `createRouteMatcher`
   - Ensure Clerk provider wraps the application

3. **User data not loading**:
   - Check network connectivity
   - Verify Clerk API keys
   - Check browser console for errors

### Debug Mode

Enable debug mode for additional logging:

```typescript
// Add to your environment variables
CLERK_DEBUG=true
```

## Best Practices

1. **Always check loading states** before rendering user-dependent content
2. **Handle errors gracefully** with user-friendly messages
3. **Use appropriate hooks** for different authentication requirements
4. **Test OAuth flows** in different browsers and devices
5. **Keep user data minimal** and respect privacy
6. **Implement proper loading states** for better UX
7. **Use role-based access control** appropriately

## Migration Guide

If migrating from another authentication system:

1. Install Clerk dependencies
2. Configure environment variables
3. Wrap app with `ClerkProvider`
4. Replace existing auth hooks with Clerk hooks
5. Update protected route logic
6. Test OAuth flows thoroughly
7. Update user data structure as needed

## Support

For issues with the authentication system:

1. Check this documentation
2. Review Clerk's official documentation
3. Check the troubleshooting section
4. Review error logs and browser console
5. Test in different environments (dev/staging/prod)