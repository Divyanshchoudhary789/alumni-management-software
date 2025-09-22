'use client';

import { Stack, Paper, Title, Text, Group, Button, Badge, Alert } from '@mantine/core';
import { IconUser, IconShield, IconLogin, IconLogout } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthStatus } from './AuthStatus';
import { UserProfile } from './UserProfile';

/**
 * Demo component showcasing all authentication features
 * This component can be used for testing and demonstration purposes
 */
export function AuthDemo() {
  const { user, isLoaded, isSignedIn, signOut, error, redirectToSignIn } = useAuth();

  return (
    <Stack gap="md">
      <Paper shadow="sm" p="md" radius="md">
        <Title order={3} mb="md">
          Authentication Status
        </Title>
        <Group gap="md" align="center">
          <AuthStatus showDetails />
          {isLoaded && (
            <Badge color={isSignedIn ? 'green' : 'gray'}>
              {isSignedIn ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          )}
        </Group>
      </Paper>

      {error && (
        <Alert color="red" title="Authentication Error">
          {error}
        </Alert>
      )}

      {isLoaded && isSignedIn && user && (
        <Paper shadow="sm" p="md" radius="md">
          <Title order={3} mb="md">
            User Information
          </Title>
          <Stack gap="sm">
            <Group gap="md">
              <IconUser size={20} />
              <div>
                <Text fw={500}>
                  {user.fullName || `${user.firstName} ${user.lastName}` || 'Unknown User'}
                </Text>
                <Text size="sm" c="dimmed">
                  {user.emailAddresses[0]?.emailAddress}
                </Text>
              </div>
            </Group>
            
            {user.role && (
              <Group gap="md">
                <IconShield size={20} />
                <Badge color={user.role === 'admin' ? 'red' : 'blue'}>
                  {user.role.toUpperCase()}
                </Badge>
              </Group>
            )}

            <UserProfile />
          </Stack>
        </Paper>
      )}

      <Paper shadow="sm" p="md" radius="md">
        <Title order={3} mb="md">
          Authentication Actions
        </Title>
        <Group gap="md">
          {!isSignedIn ? (
            <Button
              leftSection={<IconLogin size={16} />}
              onClick={redirectToSignIn}
              variant="filled"
            >
              Sign In
            </Button>
          ) : (
            <Button
              leftSection={<IconLogout size={16} />}
              onClick={signOut}
              variant="outline"
              color="red"
            >
              Sign Out
            </Button>
          )}
        </Group>
      </Paper>

      <Paper shadow="sm" p="md" radius="md">
        <Title order={3} mb="md">
          OAuth Providers
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          The following OAuth providers are configured:
        </Text>
        <Group gap="md">
          <Badge color="blue">Google OAuth</Badge>
          <Badge color="blue">LinkedIn OAuth</Badge>
        </Group>
      </Paper>

      <Paper shadow="sm" p="md" radius="md">
        <Title order={3} mb="md">
          Protected Routes
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          The following routes are protected and require authentication:
        </Text>
        <Stack gap="xs">
          <Text size="sm">• /dashboard</Text>
          <Text size="sm">• /alumni</Text>
          <Text size="sm">• /events</Text>
          <Text size="sm">• /communications</Text>
          <Text size="sm">• /donations</Text>
          <Text size="sm">• /mentorship</Text>
          <Text size="sm">• /analytics</Text>
          <Text size="sm">• /settings</Text>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default AuthDemo;