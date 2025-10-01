'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  Button,
  Avatar,
  Text,
  Group,
  Badge,
  Divider,
  ActionIcon,
} from '@mantine/core';
import { IconChevronDown, IconUser, IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { getDevUser } from '@/lib/dev-config';

const testUsers = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@alumni-dashboard.com',
    role: 'admin',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'alumni-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'alumni',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    graduationYear: 2020,
    company: 'Tech Corp',
  },
  {
    id: 'alumni-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'alumni',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    graduationYear: 2018,
    company: 'Marketing Solutions Inc',
  },
];

export function DevUserSwitcher() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const user = getDevUser();
    setCurrentUser(user);
  }, []);

  const switchUser = (user: any) => {
    const userData = {
      id: user.id,
      fullName: user.name,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ')[1] || '',
      emailAddresses: [{ emailAddress: user.email }],
      imageUrl: user.avatar,
      publicMetadata: {
        role: user.role,
        graduationYear: user.graduationYear,
        company: user.company,
      },
    };

    localStorage.setItem('dev-user', JSON.stringify(userData));
    setCurrentUser(userData);

    // Refresh the page to update all components
    window.location.reload();
  };

  const signOut = () => {
    localStorage.removeItem('dev-user');
    router.push('/dev-signin');
  };

  if (!isClient || !currentUser) {
    return null;
  }

  return (
    <Menu shadow="md" width={280} position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          size="sm"
          leftSection={
            <Avatar src={currentUser.imageUrl} size={24} radius="xl" />
          }
          rightSection={<IconChevronDown size={14} />}
          style={{
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
          }}
        >
          <Group gap={8}>
            <Text size="sm" fw={500}>
              {currentUser.firstName}
            </Text>
            <Badge size="xs" color="yellow" variant="light">
              DEV
            </Badge>
          </Group>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Current User</Menu.Label>
        <Group p="xs" gap="sm">
          <Avatar src={currentUser.imageUrl} size={32} radius="xl" />
          <div>
            <Text size="sm" fw={500}>
              {currentUser.fullName}
            </Text>
            <Text size="xs" c="dimmed">
              {currentUser.publicMetadata?.role || 'alumni'}
            </Text>
          </div>
        </Group>

        <Divider />

        <Menu.Label>Switch User</Menu.Label>
        {testUsers.map(user => (
          <Menu.Item
            key={user.id}
            leftSection={<Avatar src={user.avatar} size={20} radius="xl" />}
            onClick={() => switchUser(user)}
            disabled={user.id === currentUser.id}
          >
            <Group justify="space-between" w="100%">
              <div>
                <Text size="sm">{user.name}</Text>
                <Text size="xs" c="dimmed">
                  {user.role}
                </Text>
              </div>
              {user.id === currentUser.id && (
                <Badge size="xs" color="blue">
                  Current
                </Badge>
              )}
            </Group>
          </Menu.Item>
        ))}

        <Divider />

        <Menu.Item
          leftSection={<IconLogout size={16} />}
          onClick={signOut}
          color="red"
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
