'use client';

import { ReactNode } from 'react';
import { Alert, Container, Title, Text, Button, Stack } from '@mantine/core';
import { IconShieldX, IconHome } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  resource?: string;
  action?: string;
  route?: string;
  adminOnly?: boolean;
  alumniOnly?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Component that guards content based on user permissions
 * Can check for specific permissions, route access, or role requirements
 */
export function PermissionGuard({
  children,
  resource,
  action,
  route,
  adminOnly = false,
  alumniOnly = false,
  fallback,
  redirectTo,
}: PermissionGuardProps) {
  const router = useRouter();
  const { 
    hasPermission, 
    canAccessRoute, 
    isAdmin, 
    isAlumni, 
    isAuthenticated,
    userRole 
  } = usePermissions();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <IconShieldX size={64} color="red" />
          <Title order={2} ta="center">Authentication Required</Title>
          <Text ta="center" c="dimmed">
            You need to be signed in to access this content.
          </Text>
          <Button onClick={() => router.push('/sign-in')}>
            Sign In
          </Button>
        </Stack>
      </Container>
    );
  }

  // Check admin-only access
  if (adminOnly && !isAdmin()) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <IconShieldX size={64} color="red" />
          <Title order={2} ta="center">Admin Access Required</Title>
          <Text ta="center" c="dimmed">
            You need administrator privileges to access this content.
          </Text>
          <Button 
            leftSection={<IconHome size={16} />}
            onClick={() => router.push(redirectTo || '/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  // Check alumni-only access
  if (alumniOnly && !isAlumni()) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <IconShieldX size={64} color="red" />
          <Title order={2} ta="center">Alumni Access Required</Title>
          <Text ta="center" c="dimmed">
            You need alumni privileges to access this content.
          </Text>
          <Button 
            leftSection={<IconHome size={16} />}
            onClick={() => router.push(redirectTo || '/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  // Check specific permission
  if (resource && action && !hasPermission(resource, action)) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <IconShieldX size={64} color="red" />
          <Title order={2} ta="center">Access Denied</Title>
          <Text ta="center" c="dimmed">
            You don't have permission to {action} {resource}.
          </Text>
          <Text ta="center" size="sm" c="dimmed">
            Current role: <strong>{userRole}</strong>
          </Text>
          <Button 
            leftSection={<IconHome size={16} />}
            onClick={() => router.push(redirectTo || '/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  // Check route access
  if (route && !canAccessRoute(route)) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <IconShieldX size={64} color="red" />
          <Title order={2} ta="center">Route Access Denied</Title>
          <Text ta="center" c="dimmed">
            You don't have access to this section of the application.
          </Text>
          <Button 
            leftSection={<IconHome size={16} />}
            onClick={() => router.push(redirectTo || '/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

/**
 * Simple wrapper for admin-only content
 */
export function AdminOnly({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <PermissionGuard adminOnly fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Simple wrapper for alumni-only content
 */
export function AlumniOnly({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <PermissionGuard alumniOnly fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Inline permission check component
 * Useful for conditional rendering without full page guards
 */
export function IfPermission({
  resource,
  action,
  children,
  fallback,
}: {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(resource, action)) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}

/**
 * Inline admin check component
 */
export function IfAdmin({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin } = usePermissions();
  
  if (isAdmin()) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}

/**
 * Inline alumni check component
 */
export function IfAlumni({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAlumni } = usePermissions();
  
  if (isAlumni()) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}