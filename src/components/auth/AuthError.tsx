'use client';

import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Button,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface AuthErrorProps {
  error?: string;
  onRetry?: () => void;
}

export function AuthError({ error, onRetry }: AuthErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.refresh();
    }
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Stack align="center" gap="md">
          <IconAlertCircle size={48} color="red" />
          <Title order={2} ta="center">
            Authentication Error
          </Title>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" w="100%">
              {error}
            </Alert>
          )}

          <Text c="dimmed" ta="center">
            There was a problem with your authentication. Please try again.
          </Text>

          <Stack gap="sm" w="100%">
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={handleRetry}
              variant="filled"
            >
              Try Again
            </Button>
            <Button onClick={handleSignIn} variant="outline">
              Go to Sign In
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

export default AuthError;
