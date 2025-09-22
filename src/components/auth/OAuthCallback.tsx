'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Paper, Stack, Title, Text, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconLoader } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

export function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, error: authError } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth errors in URL params
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMessage(errorDescription || 'OAuth authentication failed');
      return;
    }

    // Wait for Clerk to load
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      setStatus('success');
      // Redirect to dashboard after successful authentication
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else if (authError) {
      setStatus('error');
      setErrorMessage(authError);
    }
  }, [isLoaded, isSignedIn, authError, searchParams, router]);

  const handleRetry = () => {
    router.push('/sign-in');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <IconLoader size={48} className="animate-spin" />
            <Title order={2} ta="center">
              Completing Sign In...
            </Title>
            <Text c="dimmed" ta="center">
              Please wait while we complete your authentication.
            </Text>
          </>
        );

      case 'success':
        return (
          <>
            <IconCheck size={48} color="green" />
            <Title order={2} ta="center">
              Welcome!
            </Title>
            <Text c="dimmed" ta="center">
              You have been successfully signed in. Redirecting to your dashboard...
            </Text>
          </>
        );

      case 'error':
        return (
          <>
            <IconAlertCircle size={48} color="red" />
            <Title order={2} ta="center">
              Authentication Failed
            </Title>
            {errorMessage && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" w="100%">
                {errorMessage}
              </Alert>
            )}
            <Text c="dimmed" ta="center">
              There was a problem completing your sign in. Please try again.
            </Text>
            <Button onClick={handleRetry} variant="filled">
              Try Again
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Stack align="center" gap="md">
          {renderContent()}
        </Stack>
      </Paper>
    </Container>
  );
}

export default OAuthCallback;