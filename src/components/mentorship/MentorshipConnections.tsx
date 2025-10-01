'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Card,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  Title,
  Grid,
  Textarea,
  Alert,
  Pagination,
  Table,
  Avatar,
  Tooltip,
  LoadingOverlay,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconUsers,
  IconCalendar,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { mockMentorshipService } from '@/lib/mock-services/mentorshipService';
import { alumniProfileService } from '@/services/alumniProfileService';
import { MentorshipConnection } from '@/types';

export function MentorshipConnections() {
  const [connections, setConnections] = useState<MentorshipConnection[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedConnection, setSelectedConnection] =
    useState<MentorshipConnection | null>(null);

  const [
    createModalOpened,
    { open: openCreateModal, close: closeCreateModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] =
    useDisclosure(false);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter) filters.status = statusFilter;

      const response = await mockMentorshipService.getMentorshipConnections(
        filters,
        { field: 'createdAt', direction: 'desc' },
        currentPage,
        10
      );

      setConnections(response.data);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load mentorship connections');
    } finally {
      setLoading(false);
    }
  };

  const loadAlumni = async () => {
    try {
      const response = await alumniProfileService.getAlumni();
      setAlumni(response.data);
    } catch (err) {
      console.error('Failed to load alumni:', err);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [searchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadAlumni();
  }, []);

  const getAlumniName = (alumniId: string) => {
    const alumnus = alumni.find(a => a.id === alumniId);
    return alumnus
      ? `${alumnus.firstName} ${alumnus.lastName}`
      : `Alumni #${alumniId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'pending':
        return 'orange';
      case 'paused':
        return 'yellow';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewConnection = (connection: MentorshipConnection) => {
    setSelectedConnection(connection);
    openViewModal();
  };

  const handleEditConnection = (connection: MentorshipConnection) => {
    setSelectedConnection(connection);
    openEditModal();
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (
      confirm('Are you sure you want to delete this mentorship connection?')
    ) {
      try {
        await mockMentorshipService.deleteMentorshipConnection(connectionId);
        loadConnections();
      } catch (err: any) {
        setError(err.message || 'Failed to delete connection');
      }
    }
  };

  const handleUpdateConnection = async (
    connectionId: string,
    updates: Partial<MentorshipConnection>
  ) => {
    try {
      await mockMentorshipService.updateMentorshipConnection(
        connectionId,
        updates
      );
      loadConnections();
      closeEditModal();
    } catch (err: any) {
      setError(err.message || 'Failed to update connection');
    }
  };

  return (
    <Stack gap="md">
      {error && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {/* Filters and Actions */}
      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Mentorship Connections</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            Create Connection
          </Button>
        </Group>

        <Group>
          <TextInput
            placeholder="Search connections..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            leftSection={<IconFilter size={16} />}
            data={[
              { value: '', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'paused', label: 'Paused' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={value => setStatusFilter(value || '')}
            clearable
          />
        </Group>
      </Card>

      {/* Connections Table */}
      <Card withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Mentor</Table.Th>
              <Table.Th>Mentee</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {connections.length > 0 ? (
              connections.map(connection => (
                <Table.Tr key={connection.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" />
                      <div>
                        <Text size="sm" fw={500}>
                          {getAlumniName(connection.mentorId)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Mentor
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" />
                      <div>
                        <Text size="sm" fw={500}>
                          {getAlumniName(connection.menteeId)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Mentee
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(connection.status)} size="sm">
                      {connection.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(connection.startDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(connection.endDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View details">
                        <ActionIcon
                          variant="light"
                          size="sm"
                          onClick={() => handleViewConnection(connection)}
                        >
                          <IconEye size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => handleEditConnection(connection)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() =>
                              handleDeleteConnection(connection.id)
                            }
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed" py="xl">
                    No mentorship connections found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
            />
          </Group>
        )}
      </Card>

      {/* View Connection Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title="Connection Details"
        size="md"
      >
        {selectedConnection && (
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" fw={500} c="dimmed">
                  Mentor
                </Text>
                <Text>{getAlumniName(selectedConnection.mentorId)}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500} c="dimmed">
                  Mentee
                </Text>
                <Text>{getAlumniName(selectedConnection.menteeId)}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500} c="dimmed">
                  Status
                </Text>
                <Badge color={getStatusColor(selectedConnection.status)}>
                  {selectedConnection.status}
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={500} c="dimmed">
                  Duration
                </Text>
                <Text>
                  {formatDate(selectedConnection.startDate)} -{' '}
                  {formatDate(selectedConnection.endDate)}
                </Text>
              </Grid.Col>
            </Grid>

            {selectedConnection.notes && (
              <div>
                <Text size="sm" fw={500} c="dimmed" mb="xs">
                  Notes
                </Text>
                <Text size="sm">{selectedConnection.notes}</Text>
              </div>
            )}
          </Stack>
        )}
      </Modal>

      {/* Edit Connection Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Connection"
        size="md"
      >
        {selectedConnection && (
          <EditConnectionForm
            connection={selectedConnection}
            onSave={handleUpdateConnection}
            onCancel={closeEditModal}
          />
        )}
      </Modal>

      {/* Create Connection Modal */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModal}
        title="Create New Connection"
        size="md"
      >
        <CreateConnectionForm
          alumni={alumni}
          onSave={() => {
            loadConnections();
            closeCreateModal();
          }}
          onCancel={closeCreateModal}
        />
      </Modal>
    </Stack>
  );
}

// Edit Connection Form Component
function EditConnectionForm({
  connection,
  onSave,
  onCancel,
}: {
  connection: MentorshipConnection;
  onSave: (id: string, updates: Partial<MentorshipConnection>) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState(connection.status);
  const [notes, setNotes] = useState(connection.notes);
  const [endDate, setEndDate] = useState<Date | null>(connection.endDate);

  const handleSave = () => {
    onSave(connection.id, {
      status,
      notes,
      endDate: endDate || connection.endDate,
    });
  };

  return (
    <Stack gap="md">
      <Select
        label="Status"
        data={[
          { value: 'active', label: 'Active' },
          { value: 'completed', label: 'Completed' },
          { value: 'pending', label: 'Pending' },
          { value: 'paused', label: 'Paused' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        value={status}
        onChange={value => setStatus(value as any)}
        required
      />

      <DateInput
        label="End Date"
        value={endDate}
        onChange={setEndDate}
        leftSection={<IconCalendar size={16} />}
      />

      <Textarea
        label="Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={4}
      />

      <Group justify="flex-end">
        <Button variant="light" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </Group>
    </Stack>
  );
}

// Create Connection Form Component
function CreateConnectionForm({
  alumni,
  onSave,
  onCancel,
}: {
  alumni: any[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [mentorId, setMentorId] = useState('');
  const [menteeId, setMenteeId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const alumniOptions = alumni.map(a => ({
    value: a.id,
    label: `${a.firstName} ${a.lastName} (${a.graduationYear})`,
  }));

  const handleSave = async () => {
    if (!mentorId || !menteeId || !startDate) return;

    try {
      setLoading(true);

      // Calculate end date if not provided (6 months from start)
      const calculatedEndDate =
        endDate || new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);

      await mockMentorshipService.createMentorshipConnection({
        mentorId,
        menteeId,
        status: 'pending',
        startDate,
        endDate: calculatedEndDate,
        notes,
      });

      onSave();
    } catch (err) {
      console.error('Failed to create connection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Select
        label="Mentor"
        placeholder="Select mentor"
        data={alumniOptions}
        value={mentorId}
        onChange={value => setMentorId(value || '')}
        searchable
        required
      />

      <Select
        label="Mentee"
        placeholder="Select mentee"
        data={alumniOptions}
        value={menteeId}
        onChange={value => setMenteeId(value || '')}
        searchable
        required
      />

      <DateInput
        label="Start Date"
        value={startDate}
        onChange={setStartDate}
        leftSection={<IconCalendar size={16} />}
        required
      />

      <DateInput
        label="End Date"
        value={endDate}
        onChange={setEndDate}
        leftSection={<IconCalendar size={16} />}
        description="Leave empty to set 6 months from start date"
      />

      <Textarea
        label="Notes"
        placeholder="Add any notes about this mentorship connection..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={4}
      />

      <Group justify="flex-end">
        <Button variant="light" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={loading}>
          Create Connection
        </Button>
      </Group>
    </Stack>
  );
}
