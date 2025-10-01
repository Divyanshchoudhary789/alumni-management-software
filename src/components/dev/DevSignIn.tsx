'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Avatar,
  Badge,
  Alert,
  Divider,
} from '@mantine/core';
import { IconUser, IconUserCheck, IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'alumni';
  avatar: string;
  description: string;
  graduationYear?: number;
  company?: string;
}

const testUsers: TestUser[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@alumni-dashboard.com',
    role: 'admin',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    description: 'System administrator with full access to all features',
  },
  {
    id: 'alumni-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'alumni',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    description: 'Software Engineer, Class of 2020',
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
    description: 'Marketing Manager, Class of 2018',
    graduationYear: 2018,
    company: 'Marketing Solutions Inc',
  },
  {
    id: 'alumni-3',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'alumni',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    description: 'Data Scientist, Class of 2019',
    graduationYear: 2019,
    company: 'Data Analytics Co',
  },
];

export function DevSignIn() {
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);
  const router = useRouter();

  const handleSignIn = (user: TestUser) => {
    // Store the selected user in localStorage for development
    localStorage.setItem(
      'dev-user',
      JSON.stringify({
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
      })
    );

    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <div style={{ textAlign: 'center' }}>
          <Title order={1}>🧪 Development Sign In</Title>
          <Text c="dimmed" mt="sm">
            Choose a test user to simulate different roles and permissions
          </Text>
        </div>

        <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
          <Text size="sm">
            This is a development-only sign-in page. In production, users will
            authenticate through Clerk.
          </Text>
        </Alert>

        <Stack gap="md">
          {testUsers.map(user => (
            <Paper
              key={user.id}
              p="md"
              withBorder
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border:
                  selectedUser?.id === user.id
                    ? '2px solid var(--mantine-color-blue-6)'
                    : undefined,
              }}
              onClick={() => setSelectedUser(user)}
            >
              <Group justify="space-between" align="flex-start">
                <Group>
                  <Avatar src={user.avatar} size="lg" radius="md" />
                  <div>
                    <Group gap="xs" align="center">
                      <Text fw={500} size="lg">
                        {user.name}
                      </Text>
                      <Badge
                        color={user.role === 'admin' ? 'red' : 'blue'}
                        variant="light"
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {user.email}
                    </Text>
                    <Text size="sm" mt="xs">
                      {user.description}
                    </Text>
                    {user.company && (
                      <Text size="xs" c="dimmed" mt="xs">
                        Currently at {user.company}
                      </Text>
                    )}
                  </div>
                </Group>
                <Button
                  variant={selectedUser?.id === user.id ? 'filled' : 'light'}
                  size="sm"
                  leftSection={<IconUserCheck size="1rem" />}
                  onClick={e => {
                    e.stopPropagation();
                    handleSignIn(user);
                  }}
                >
                  Sign In
                </Button>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Divider label="Quick Actions" labelPosition="center" />

        <Group justify="center">
          <Button
            variant="outline"
            leftSection={<IconUser size="1rem" />}
            onClick={() => handleSignIn(testUsers[0])} // Admin user
          >
            Sign in as Admin
          </Button>
          <Button
            variant="outline"
            leftSection={<IconUser size="1rem" />}
            onClick={() => handleSignIn(testUsers[1])} // Alumni user
          >
            Sign in as Alumni
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          💡 Tip: Admin users can access all features, while Alumni users have
          limited permissions
        </Text>
      </Stack>
    </Container>
  );
}
