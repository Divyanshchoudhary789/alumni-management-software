'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingOverlay, Container } from '@mantine/core';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    // Check if we're in development mode with invalid Clerk keys
    const devMode =
      process.env.NODE_ENV === 'development' &&
      (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your-') ||
        !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    setIsDevMode(devMode);
  }, []);

  // Show loading until client-side hydration is complete
  if (!isClient) {
    return (
      <Container size="xl" style={{ position: 'relative', minHeight: '100vh' }}>
        <LoadingOverlay
          visible={true}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
      </Container>
    );
  }

  // In development mode with invalid Clerk keys, bypass authentication
  if (isDevMode) {
    console.log('🚧 Development mode: Authentication bypassed');
    return <>{children}</>;
  }

  // Normal Clerk authentication flow
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <Container size="xl" style={{ position: 'relative', minHeight: '100vh' }}>
        <LoadingOverlay
          visible={true}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
      </Container>
    );
  }

  if (!isSignedIn) {
    return fallback || null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
