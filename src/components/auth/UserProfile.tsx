'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Group, Text, Avatar, Menu, UnstyledButton, rem, Skeleton, Alert } from '@mantine/core';
import { IconChevronDown, IconSettings, IconLogout, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

export function UserProfile() {
  const { user, isLoaded, error } = useAuth();

  if (!isLoaded) {
    return (
      <Group gap="xs">
        <Skeleton height={32} width={32} radius="xl" />
        <div>
          <Skeleton height={16} width={100} mb={4} />
          <Skeleton height={12} width={140} />
        </div>
      </Group>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" size="sm">
        Authentication error
      </Alert>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Group gap="xs">
      <Group gap="xs">
        <Avatar
          src={user.imageUrl}
          alt={user.fullName || user.emailAddresses[0]?.emailAddress}
          size="sm"
        />
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {user.fullName || user.firstName || 'User'}
          </Text>
          <Text c="dimmed" size="xs">
            {user.emailAddresses[0]?.emailAddress}
          </Text>
        </div>
      </Group>
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
          },
        }}
        afterSignOutUrl="/sign-in"
      />
    </Group>
  );
}

export function UserProfileMenu() {
  const { user, isLoaded, signOut, error } = useAuth();

  if (!isLoaded) {
    return (
      <Group gap="xs">
        <Skeleton height={32} width={32} radius="xl" />
        <div>
          <Skeleton height={16} width={100} mb={4} />
          <Skeleton height={12} width={140} />
        </div>
        <Skeleton height={14} width={14} />
      </Group>
    );
  }

  if (error || !user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap="xs">
            <Avatar
              src={user.imageUrl}
              alt={user.fullName || user.emailAddresses[0]?.emailAddress}
              size="sm"
            />
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {user.fullName || user.firstName || 'User'}
              </Text>
              <Text c="dimmed" size="xs">
                {user.emailAddresses[0]?.emailAddress}
              </Text>
            </div>
            <IconChevronDown style={{ width: rem(14), height: rem(14) }} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
          Settings
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
          onClick={handleSignOut}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}