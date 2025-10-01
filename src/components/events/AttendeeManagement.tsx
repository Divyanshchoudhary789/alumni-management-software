'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Badge,
  Avatar,
  ActionIcon,
  Menu,
  TextInput,
  Select,
  Table,
  Checkbox,
  Modal,
  Alert,
  Pagination,
  rem,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconSearch,
  IconDots,
  IconUserCheck,
  IconUserX,
  IconMail,
  IconDownload,
  IconFilter,
  IconAlertCircle,
} from '@tabler/icons-react';
import { Event, EventRegistration, AlumniProfile } from '@/types';
import { mockEventService } from '@/lib/mock-services/eventService';
import { alumniProfileService } from '@/services/alumniProfileService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { format } from 'date-fns';

interface AttendeeWithProfile extends EventRegistration {
  profile?: AlumniProfile;
}

interface AttendeeManagementProps {
  event: Event;
  onEventUpdate?: () => void;
}

export function AttendeeManagement({
  event,
  onEventUpdate,
}: AttendeeManagementProps) {
  const [attendees, setAttendees] = useState<AttendeeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const loadAttendees = async () => {
    try {
      setLoading(true);

      // Get event registrations
      const registrationsResponse =
        await mockEventService.getEventRegistrations(event.id);
      const registrations = registrationsResponse.data;

      // Get alumni profiles for attendees
      const alumniResponse = await alumniProfileService.getAlumni();
      const allAlumni = alumniResponse.data;

      // Combine registration data with alumni profiles
      const attendeesWithProfiles = registrations.map(registration => ({
        ...registration,
        profile: allAlumni.find(alumni => alumni.id === registration.alumniId),
      }));

      setAttendees(attendeesWithProfiles);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load attendees',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendees();
  }, [event.id]);

  // Filter attendees
  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch =
      !searchQuery ||
      (attendee.profile &&
        (`${attendee.profile.firstName} ${attendee.profile.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          attendee.profile.currentCompany
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())));

    const matchesStatus =
      statusFilter === 'all' || attendee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginate attendees
  const paginatedAttendees = filteredAttendees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredAttendees.length / ITEMS_PER_PAGE);

  const handleCheckIn = async (attendeeId: string) => {
    try {
      // In a real implementation, this would update the registration status
      const updatedAttendees = attendees.map(attendee =>
        attendee.id === attendeeId
          ? { ...attendee, status: 'attended' as const }
          : attendee
      );
      setAttendees(updatedAttendees);

      notifications.show({
        title: 'Success',
        message: 'Attendee checked in successfully',
        color: 'green',
      });

      onEventUpdate?.();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to check in attendee',
        color: 'red',
      });
    }
  };

  const handleCancelRegistration = (
    attendeeId: string,
    attendeeName: string
  ) => {
    modals.openConfirmModal({
      title: 'Cancel Registration',
      children: (
        <Text size="sm">
          Are you sure you want to cancel the registration for {attendeeName}?
        </Text>
      ),
      labels: { confirm: 'Cancel Registration', cancel: 'Keep Registration' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const updatedAttendees = attendees.map(attendee =>
            attendee.id === attendeeId
              ? { ...attendee, status: 'cancelled' as const }
              : attendee
          );
          setAttendees(updatedAttendees);

          notifications.show({
            title: 'Success',
            message: 'Registration cancelled successfully',
            color: 'green',
          });

          onEventUpdate?.();
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: 'Failed to cancel registration',
            color: 'red',
          });
        }
      },
    });
  };

  const handleBulkCheckIn = () => {
    modals.openConfirmModal({
      title: 'Bulk Check-in',
      children: (
        <Text size="sm">
          Are you sure you want to check in {selectedAttendees.length} selected
          attendees?
        </Text>
      ),
      labels: { confirm: 'Check In All', cancel: 'Cancel' },
      onConfirm: async () => {
        try {
          const updatedAttendees = attendees.map(attendee =>
            selectedAttendees.includes(attendee.id)
              ? { ...attendee, status: 'attended' as const }
              : attendee
          );
          setAttendees(updatedAttendees);
          setSelectedAttendees([]);

          notifications.show({
            title: 'Success',
            message: `${selectedAttendees.length} attendees checked in successfully`,
            color: 'green',
          });

          onEventUpdate?.();
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: 'Failed to check in attendees',
            color: 'red',
          });
        }
      },
    });
  };

  const handleExportAttendees = () => {
    // In a real implementation, this would generate and download a CSV/Excel file
    const csvContent = [
      [
        'Name',
        'Email',
        'Company',
        'Position',
        'Graduation Year',
        'Registration Date',
        'Status',
      ].join(','),
      ...filteredAttendees.map(attendee =>
        [
          attendee.profile
            ? `${attendee.profile.firstName} ${attendee.profile.lastName}`
            : 'Unknown',
          attendee.profile?.userId || 'N/A', // In real app, this would be email
          attendee.profile?.currentCompany || 'N/A',
          attendee.profile?.currentPosition || 'N/A',
          attendee.profile?.graduationYear || 'N/A',
          format(attendee.registrationDate, 'PPP'),
          attendee.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    notifications.show({
      title: 'Success',
      message: 'Attendee list exported successfully',
      color: 'green',
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'registered', label: 'Registered' },
    { value: 'attended', label: 'Attended' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusBadge = (status: EventRegistration['status']) => {
    const config = {
      registered: { color: 'blue', label: 'Registered' },
      attended: { color: 'green', label: 'Attended' },
      cancelled: { color: 'red', label: 'Cancelled' },
    };

    const { color, label } = config[status];
    return (
      <Badge color={color} variant="light" size="sm">
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={3}>Attendee Management</Title>
            <Text size="sm" c="dimmed">
              {filteredAttendees.length} attendees
            </Text>
          </div>

          <Group>
            {selectedAttendees.length > 0 && (
              <Button
                size="sm"
                leftSection={<IconUserCheck size={16} />}
                onClick={handleBulkCheckIn}
              >
                Check In Selected ({selectedAttendees.length})
              </Button>
            )}

            <Button
              size="sm"
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={handleExportAttendees}
            >
              Export
            </Button>
          </Group>
        </Group>

        {/* Filters */}
        <Group>
          <TextInput
            placeholder="Search attendees..."
            leftSection={
              <IconSearch style={{ width: rem(16), height: rem(16) }} />
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />

          <Select
            placeholder="Filter by status"
            data={statusOptions}
            value={statusFilter}
            onChange={value => setStatusFilter(value || 'all')}
            leftSection={
              <IconFilter style={{ width: rem(16), height: rem(16) }} />
            }
            w={150}
          />
        </Group>

        {/* Attendees Table */}
        {filteredAttendees.length === 0 ? (
          <Alert icon={<IconAlertCircle />} title="No attendees found">
            {attendees.length === 0
              ? 'No one has registered for this event yet.'
              : 'No attendees match your current filters.'}
          </Alert>
        ) : (
          <>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Checkbox
                      checked={
                        selectedAttendees.length === paginatedAttendees.length
                      }
                      indeterminate={
                        selectedAttendees.length > 0 &&
                        selectedAttendees.length < paginatedAttendees.length
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedAttendees(
                            paginatedAttendees.map(a => a.id)
                          );
                        } else {
                          setSelectedAttendees([]);
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th>Attendee</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Registration Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedAttendees.map(attendee => (
                  <Table.Tr key={attendee.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedAttendees.includes(attendee.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedAttendees([
                              ...selectedAttendees,
                              attendee.id,
                            ]);
                          } else {
                            setSelectedAttendees(
                              selectedAttendees.filter(id => id !== attendee.id)
                            );
                          }
                        }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar
                          src={attendee.profile?.profileImage}
                          alt={
                            attendee.profile
                              ? `${attendee.profile.firstName} ${attendee.profile.lastName}`
                              : 'Unknown'
                          }
                          size="sm"
                        />
                        <div>
                          <Text size="sm" fw={500}>
                            {attendee.profile
                              ? `${attendee.profile.firstName} ${attendee.profile.lastName}`
                              : 'Unknown User'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Class of {attendee.profile?.graduationYear || 'N/A'}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {attendee.profile?.currentCompany || 'N/A'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {attendee.profile?.currentPosition || 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {format(attendee.registrationDate, 'PPP')}
                      </Text>
                    </Table.Td>
                    <Table.Td>{getStatusBadge(attendee.status)}</Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots
                              style={{ width: rem(16), height: rem(16) }}
                            />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {attendee.status === 'registered' && (
                            <Menu.Item
                              leftSection={
                                <IconUserCheck
                                  style={{ width: rem(14), height: rem(14) }}
                                />
                              }
                              onClick={() => handleCheckIn(attendee.id)}
                            >
                              Check In
                            </Menu.Item>
                          )}

                          <Menu.Item
                            leftSection={
                              <IconMail
                                style={{ width: rem(14), height: rem(14) }}
                              />
                            }
                            onClick={() => {
                              // In real implementation, this would open email composer
                              notifications.show({
                                title: 'Feature Coming Soon',
                                message:
                                  'Email functionality will be implemented in future updates',
                                color: 'blue',
                              });
                            }}
                          >
                            Send Email
                          </Menu.Item>

                          {attendee.status !== 'cancelled' && (
                            <Menu.Item
                              color="red"
                              leftSection={
                                <IconUserX
                                  style={{ width: rem(14), height: rem(14) }}
                                />
                              }
                              onClick={() =>
                                handleCancelRegistration(
                                  attendee.id,
                                  attendee.profile
                                    ? `${attendee.profile.firstName} ${attendee.profile.lastName}`
                                    : 'Unknown User'
                                )
                              }
                            >
                              Cancel Registration
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                />
              </Group>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
