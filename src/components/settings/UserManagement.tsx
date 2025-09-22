'use client';

import { useState } from 'react';
import {
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Modal,
  Table,
  Badge,
  ActionIcon,
  Text,
  Title,
  Card,
  Avatar,
  Menu,
  Pagination,
  Alert,
  Switch,
  Checkbox,
  Grid,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDots,
  IconShield,
  IconUser,
  IconMail,
  IconCheck,
  IconX,
  IconAlertCircle
} from '@tabler/icons-react';
import { settingsService } from '@/lib/mock-services/settingsService';
import { User, UserPermission } from '@/types';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermission | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);
  const [permissionsOpened, { open: openPermissions, close: closePermissions }] = useDisclosure(false);

  const userForm = useForm({
    initialValues: {
      email: '',
      role: 'alumni' as 'admin' | 'alumni',
      firstName: '',
      lastName: ''
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      firstName: (value) => (!value ? 'First name is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null)
    }
  });

  const permissionForm = useForm({
    initialValues: {
      alumni: {
        view: false,
        create: false,
        edit: false,
        delete: false
      },
      events: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        manageRegistrations: false
      },
      communications: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        send: false
      },
      donations: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        viewReports: false
      },
      mentorship: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        manageConnections: false
      },
      analytics: {
        view: false,
        export: false,
        viewSensitiveData: false
      },
      settings: {
        view: false,
        edit: false,
        manageUsers: false,
        manageIntegrations: false
      }
    }
  });

  const handleCreateUser = async (values: typeof userForm.values) => {
    setLoading(true);
    try {
      await settingsService.createUser(values);
      notifications.show({
        title: 'User Created',
        message: 'New user has been created successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      });
      userForm.reset();
      close();
      // Refresh users list
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create user',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async (values: typeof permissionForm.values) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await settingsService.updateUserPermissions(selectedUser.id, values);
      notifications.show({
        title: 'Permissions Updated',
        message: 'User permissions have been updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      });
      closePermissions();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update permissions',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const openUserPermissions = async (user: User) => {
    setSelectedUser(user);
    try {
      const userPermissions = await settingsService.getUserPermissions(user.id);
      if (userPermissions) {
        permissionForm.setValues(userPermissions.permissions);
      }
      openPermissions();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load user permissions',
        color: 'red'
      });
    }
  };

  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@university.edu',
      role: 'admin',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      email: 'john.doe@alumni.edu',
      role: 'alumni',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '3',
      email: 'jane.smith@alumni.edu',
      role: 'alumni',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    }
  ];

  const PermissionSection = ({ title, permissions, prefix }: { 
    title: string; 
    permissions: Record<string, boolean>; 
    prefix: string;
  }) => (
    <Card withBorder>
      <Title order={5} mb="sm">{title}</Title>
      <Grid>
        {Object.entries(permissions).map(([key, value]) => (
          <Grid.Col span={6} key={key}>
            <Checkbox
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              {...permissionForm.getInputProps(`${prefix}.${key}`, { type: 'checkbox' })}
            />
          </Grid.Col>
        ))}
      </Grid>
    </Card>
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={3}>User Management</Title>
          <Text c="dimmed" size="sm">
            Manage user accounts and their access permissions
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add User
        </Button>
      </Group>

      <Alert icon={<IconShield size={16} />} color="blue">
        User permissions control access to different sections of the system. Admin users have full access by default.
      </Alert>

      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {mockUsers.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar size="sm" color="blue">
                      <IconUser size={16} />
                    </Avatar>
                    <Text size="sm" fw={500}>
                      {user.email.split('@')[0]}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{user.email}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={user.role === 'admin' ? 'red' : 'blue'} variant="light">
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {user.createdAt.toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconShield size={14} />}
                        onClick={() => openUserPermissions(user)}
                      >
                        Manage Permissions
                      </Menu.Item>
                      <Menu.Item leftSection={<IconEdit size={14} />}>
                        Edit User
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        disabled={user.role === 'admin'}
                      >
                        Delete User
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Group justify="center" mt="md">
          <Pagination
            value={activePage}
            onChange={setActivePage}
            total={Math.ceil(mockUsers.length / 10)}
          />
        </Group>
      </Card>

      {/* Add User Modal */}
      <Modal opened={opened} onClose={close} title="Add New User" size="md">
        <form onSubmit={userForm.onSubmit(handleCreateUser)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="First Name"
                  placeholder="Enter first name"
                  required
                  {...userForm.getInputProps('firstName')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Last Name"
                  placeholder="Enter last name"
                  required
                  {...userForm.getInputProps('lastName')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Email"
              placeholder="user@example.com"
              required
              {...userForm.getInputProps('email')}
            />
            <Select
              label="Role"
              data={[
                { value: 'alumni', label: 'Alumni' },
                { value: 'admin', label: 'Administrator' }
              ]}
              {...userForm.getInputProps('role')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create User
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Permissions Modal */}
      <Modal 
        opened={permissionsOpened} 
        onClose={closePermissions} 
        title={`Manage Permissions - ${selectedUser?.email}`}
        size="xl"
      >
        <form onSubmit={permissionForm.onSubmit(handleUpdatePermissions)}>
          <Stack gap="md">
            <Alert icon={<IconShield size={16} />} color="blue">
              Configure what this user can access and modify in the system.
            </Alert>

            <PermissionSection
              title="Alumni Management"
              permissions={permissionForm.values.alumni}
              prefix="alumni"
            />

            <PermissionSection
              title="Event Management"
              permissions={permissionForm.values.events}
              prefix="events"
            />

            <PermissionSection
              title="Communications"
              permissions={permissionForm.values.communications}
              prefix="communications"
            />

            <PermissionSection
              title="Donations"
              permissions={permissionForm.values.donations}
              prefix="donations"
            />

            <PermissionSection
              title="Mentorship"
              permissions={permissionForm.values.mentorship}
              prefix="mentorship"
            />

            <PermissionSection
              title="Analytics"
              permissions={permissionForm.values.analytics}
              prefix="analytics"
            />

            <PermissionSection
              title="System Settings"
              permissions={permissionForm.values.settings}
              prefix="settings"
            />

            <Divider />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={closePermissions}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Permissions
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}