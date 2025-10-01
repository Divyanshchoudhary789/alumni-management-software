'use client';

import { Group, Text, Badge, Tooltip } from '@mantine/core';
import {
  IconUser,
  IconUserCheck,
  IconUserX,
  IconLoader,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthStatusProps {
  showDetails?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AuthStatus({
  showDetails = false,
  size = 'sm',
}: AuthStatusProps) {
  const { isLoaded, isSignedIn, user, isLoading, error } = useAuth();

  if (isLoading || !isLoaded) {
    return (
      <Group gap="xs">
        <IconLoader size={16} className="animate-spin" />
        {showDetails && (
          <Text size={size} c="dimmed">
            Loading...
          </Text>
        )}
      </Group>
    );
  }

  if (error) {
    return (
      <Tooltip label={error}>
        <Group gap="xs">
          <IconUserX size={16} color="red" />
          {showDetails && (
            <Badge color="red" size={size}>
              Error
            </Badge>
          )}
        </Group>
      </Tooltip>
    );
  }

  if (!isSignedIn) {
    return (
      <Group gap="xs">
        <IconUser size={16} color="gray" />
        {showDetails && (
          <Badge color="gray" size={size}>
            Not signed in
          </Badge>
        )}
      </Group>
    );
  }

  return (
    <Group gap="xs">
      <IconUserCheck size={16} color="green" />
      {showDetails && (
        <Group gap="xs">
          <Badge color="green" size={size}>
            Signed in
          </Badge>
          {user && (
            <Text size={size} c="dimmed">
              as {user.firstName || user.emailAddresses[0]?.emailAddress}
            </Text>
          )}
        </Group>
      )}
    </Group>
  );
}

export default AuthStatus;
