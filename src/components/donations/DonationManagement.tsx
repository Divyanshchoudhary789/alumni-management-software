'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Table,
  Text,
  Badge,
  Group,
  Avatar,
  Button,
  ActionIcon,
  Menu,
  TextInput,
  Select,
  Pagination,
  Stack,
  Skeleton,
  Alert,
  Modal,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
  IconPlus,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { mockDonationService } from '@/lib/mock-services';
import { mockData } from '@/lib/mock-data';
import { DonationForm } from './DonationForm';

interface DonationManagementProps {
  showAddButton?: boolean;
}

export function DonationManagement({ showAddButton = true }: DonationManagementProps) {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [purposeFilter, setPurposeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formOpened, setFormOpened] = useState(false);
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<any>(null);

  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await mockDonationService.getDonations(
        {
          search: debouncedSearch,
          status: statusFilter as any,
          purpose: purposeFilter,
        },
        { field: 'donationDate', direction: 'desc' },
        currentPage,
        10
      );

      setDonations(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading donations:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load donations',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [debouncedSearch, statusFilter, purposeFilter, currentPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getDonorInfo = (donorId: string) => {
    const donor = mockData.alumni.find(a => a.id === donorId);
    return donor ? {
      name: `${donor.firstName} ${donor.lastName}`,
      avatar: donor.profileImage,
      company: donor.currentCompany,
    } : {
      name: 'Anonymous Donor',
      avatar: null,
      company: null,
    };
  };

  const handleEdit = (donation: any) => {
    setEditingDonation(donation);
    setFormOpened(true);
  };

  const handleDelete = (donation: any) => {
    setDonationToDelete(donation);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    try {
      // Mock delete operation
      notifications.show({
        title: 'Success',
        message: 'Donation deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      setDeleteModalOpened(false);
      setDonationToDelete(null);
      loadDonations();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete donation',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const handleStatusUpdate = async (donationId: string, newStatus: string) => {
    try {
      await mockDonationService.updateDonationStatus(donationId, newStatus as any);
      notifications.show({
        title: 'Success',
        message: 'Donation status updated',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      loadDonations();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update status',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const handleFormSuccess = () => {
    setEditingDonation(null);
    loadDonations();
  };

  const handleExport = () => {
    notifications.show({
      title: 'Export Started',
      message: 'Donation data is being exported...',
      color: 'blue',
    });
  };

  const purposeOptions = [
    { value: '', label: 'All Purposes' },
    { value: 'General Fund', label: 'General Fund' },
    { value: 'Scholarship Fund', label: 'Scholarship Fund' },
    { value: 'Alumni Events', label: 'Alumni Events' },
    { value: 'Infrastructure Development', label: 'Infrastructure Development' },
    { value: 'Research Fund', label: 'Research Fund' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <>
      <Card padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Donation Management</Title>
          <Group>
            <ActionIcon variant="light" onClick={loadDonations} loading={loading}>
              <IconRefresh size={16} />
            </ActionIcon>
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
            >
              Export
            </Button>
            {showAddButton && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setFormOpened(true)}
              >
                Record Donation
              </Button>
            )}
          </Group>
        </Group>

        {/* Filters */}
        <Group mb="md">
          <TextInput
            placeholder="Search donations..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            data={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || '')}
            clearable
            leftSection={<IconFilter size={16} />}
          />
          <Select
            placeholder="Filter by purpose"
            data={purposeOptions}
            value={purposeFilter}
            onChange={(value) => setPurposeFilter(value || '')}
            clearable
            leftSection={<IconFilter size={16} />}
          />
        </Group>

        {loading ? (
          <Stack gap="sm">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} height={60} />
            ))}
          </Stack>
        ) : donations.length > 0 ? (
          <>
            <Table.ScrollContainer minWidth={800}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Donor</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Purpose</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Payment Method</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {donations.map((donation) => {
                    const donorInfo = getDonorInfo(donation.donorId);
                    
                    return (
                      <Table.Tr key={donation.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar 
                              src={donorInfo.avatar} 
                              size="sm" 
                              radius="xl"
                            >
                              {donorInfo.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {donorInfo.name}
                              </Text>
                              {donorInfo.company && (
                                <Text size="xs" c="dimmed">
                                  {donorInfo.company}
                                </Text>
                              )}
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500} c="green">
                            {formatCurrency(donation.amount)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {donation.purpose}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {new Date(donation.donationDate).toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {donation.paymentMethod}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={getStatusColor(donation.status)} 
                            variant="light"
                            size="sm"
                          >
                            {donation.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="light" size="sm">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEye size={14} />}
                                onClick={() => {/* View details */}}
                              >
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => handleEdit(donation)}
                              >
                                Edit
                              </Menu.Item>
                              {donation.status === 'pending' && (
                                <>
                                  <Menu.Item
                                    leftSection={<IconCheck size={14} />}
                                    onClick={() => handleStatusUpdate(donation.id, 'completed')}
                                  >
                                    Mark Completed
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={<IconAlertCircle size={14} />}
                                    onClick={() => handleStatusUpdate(donation.id, 'failed')}
                                  >
                                    Mark Failed
                                  </Menu.Item>
                                </>
                              )}
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => handleDelete(donation)}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            <Group justify="center" mt="md">
              <Pagination
                value={currentPage}
                onChange={setCurrentPage}
                total={totalPages}
              />
            </Group>
          </>
        ) : (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text>No donations found matching your criteria.</Text>
          </Alert>
        )}
      </Card>

      {/* Donation Form Modal */}
      <DonationForm
        opened={formOpened}
        onClose={() => {
          setFormOpened(false);
          setEditingDonation(null);
        }}
        onSuccess={handleFormSuccess}
        editingDonation={editingDonation}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this donation? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteModalOpened(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}