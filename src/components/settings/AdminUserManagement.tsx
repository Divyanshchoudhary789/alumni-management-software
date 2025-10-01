'use client';

import { useState, useEffect } from 'react';
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
  Checkbox,
  Grid,
  Divider,
  Loader,
  Flex,
  Paper,
  Tabs,
  NumberInput,
  MultiSelect,
  Tooltip,
  Progress,
  ScrollArea,
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
  IconAlertCircle,
  IconExternalLink,
  IconUsers,
  IconSearch,
  IconRefresh,
  IconDownload,
  IconUpload,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconEye,
  IconUserCheck,
  IconUserX,
  IconCrown,
  IconCalendar,
} from '@tabler/icons-react';
import { useAuth } from '@clerk/nextjs';
import { authApiService, User } from '@/services/api/authService';

interface UserStats {
  total: number;
  roles: {
    admin: number;
    alumni: number;
  };
  recentSignups: number;
}

export function AdminUserManagement() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(20);
  
  const [opened, { open, close }] = useDisclosure(false);
  const [bulkOpened, { open: openBulk, close: closeBulk }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const bulkForm = useForm({
    initialValues: {
      action: 'role',
      role: 'alumni' as 'admin' | 'alumni',
    },
  });

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = {
        page: activePage,
        limit: pageSize,
        ...(roleFilter && { role: roleFilter }),
        ...(searchQuery && { search: searchQuery }),
        sortBy,
        sortOrder,
      };

      const data = await authApiService.getUsers(params);
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setStats(data.stats);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load users',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'alumni') => {
    try {
      setLoading(true);
      await authApiService.updateUserRole(userId, newRole);
      
      notifications.show({
        title: 'Success',
        message: 'User role updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      await fetchUsers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update user role',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOperation = async (values: typeof bulkForm.values) => {
    if (selectedUsers.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select users first',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      
      if (values.action === 'role') {
        const response = await fetch('/api/auth/users/bulk-role', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${await getToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds: selectedUsers,
            role: values.role,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update roles');
        }

        notifications.show({
          title: 'Success',
          message: `Updated ${selectedUsers.length} users successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      setSelectedUsers([]);
      closeBulk();
      await fetchUsers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to perform bulk operation',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await authApiService.deleteUser(selectedUser.id);
      
      notifications.show({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      closeDelete();
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUser = async (userId: string) => {
    try {
      setLoading(true);
      const token = await getToken();
      
      const response = await fetch(`/api/auth/users/${userId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync user');
      }

      notifications.show({
        title: 'Success',
        message: 'User synced successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      await fetchUsers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to sync user',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users