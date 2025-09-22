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
  Alert,
  Table,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
  Textarea,
  rem,
  Loader,
  Center
} from '@mantine/core';
import {
  IconUsers,
  IconUserPlus,
  IconUserX,
  IconMail,
  IconDots,
  IconAlertCircle,
  IconClock,
  IconArrowUp
} from '@tabler/icons-react';
import { Event, AlumniProfile } from '@/types';
import { mockAlumniService } from '@/lib/mock-services/alumniService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { format } from 'date-fns';

interface WaitlistEntry {
  id: string;
  alumniId: string;
  eventId: string;
  joinedDate: Date;
  position: number;
  notified: boolean;
  profile?: AlumniProfile;
}

interface WaitlistManagementProps {
  event: Event;
  onEventUpdate?: () => void;
}

export function WaitlistManagement({ event, onEventUpdate }: WaitlistManagementProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addToWaitlistModalOpen, setAddToWaitlistModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<string>('');
  const [availableAlumni, setAvailableAlumni] = useState<AlumniProfile[]>([]);

  // Mock waitlist data - in real implementation, this would come from the API
  const generateMockWaitlist = async (): Promise<WaitlistEntry[]> => {
    const alumniResponse = await mockAlumniService.getAlumni();
    const allAlumni = alumniResponse.data;
    
    // Get registered alumni IDs to exclude them
    const registeredAlumniIds = event.registrations?.map(r => r.alumniId) || [];
    
    // Create mock waitlist entries
    const availableForWaitlist = allAlumni.filter(alumni => 
      !registeredAlumniIds.includes(alumni.id)
    ).slice(0, 5); // Mock 5 people on waitlist

    return availableForWaitlist.map((alumni, index) => ({
      id: `waitlist_${alumni.id}`,
      alumniId: alumni.id,
      eventId: event.id,
      joinedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
      position: index + 1,
      notified: Math.random() > 0.5,
      profile: alumni
    }));
  };

  const loadWaitlist = async () => {
    try {
      setLoading(true);
      
      // In real implementation, this would be an API call
      const mockWaitlist = await generateMockWaitlist();
      setWaitlist(mockWaitlist);

      // Load available alumni for adding to waitlist
      const alumniResponse = await mockAlumniService.getAlumni();
      const registeredAlumniIds = event.registrations?.map(r => r.alumniId) || [];
      const waitlistAlumniIds = mockWaitlist.map(w => w.alumniId);
      
      const available = alumniResponse.data.filter(alumni => 
        !registeredAlumniIds.includes(alumni.id) && 
        !waitlistAlumniIds.includes(alumni.id)
      );
      
      setAvailableAlumni(available);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load waitlist',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, [event.id]);

  const handlePromoteFromWaitlist = async (waitlistEntry: WaitlistEntry) => {
    try {
      // Check if there's space available
      const currentRegistrations = event.registrations?.filter(r => r.status === 'registered').length || 0;
      
      if (currentRegistrations >= event.capacity) {
        notifications.show({
          title: 'Cannot Promote',
          message: 'Event is at full capacity',
          color: 'orange'
        });
        return;
      }

      // Remove from waitlist and add to registrations
      const updatedWaitlist = waitlist.filter(w => w.id !== waitlistEntry.id)
        .map((w, index) => ({ ...w, position: index + 1 })); // Reorder positions
      
      setWaitlist(updatedWaitlist);

      notifications.show({
        title: 'Success',
        message: `${waitlistEntry.profile?.firstName} ${waitlistEntry.profile?.lastName} has been promoted from waitlist`,
        color: 'green'
      });

      onEventUpdate?.();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to promote from waitlist',
        color: 'red'
      });
    }
  };

  const handleRemoveFromWaitlist = (waitlistEntry: WaitlistEntry) => {
    modals.openConfirmModal({
      title: 'Remove from Waitlist',
      children: (
        <Text size="sm">
          Are you sure you want to remove {waitlistEntry.profile?.firstName} {waitlistEntry.profile?.lastName} from the waitlist?
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const updatedWaitlist = waitlist.filter(w => w.id !== waitlistEntry.id)
            .map((w, index) => ({ ...w, position: index + 1 })); // Reorder positions
          
          setWaitlist(updatedWaitlist);

          notifications.show({
            title: 'Success',
            message: 'Removed from waitlist successfully',
            color: 'green'
          });
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: 'Failed to remove from waitlist',
            color: 'red'
          });
        }
      }
    });
  };

  const handleAddToWaitlist = async () => {
    if (!selectedAlumni) return;

    try {
      const alumni = availableAlumni.find(a => a.id === selectedAlumni);
      if (!alumni) return;

      const newWaitlistEntry: WaitlistEntry = {
        id: `waitlist_${alumni.id}`,
        alumniId: alumni.id,
        eventId: event.id,
        joinedDate: new Date(),
        position: waitlist.length + 1,
        notified: false,
        profile: alumni
      };

      setWaitlist([...waitlist, newWaitlistEntry]);
      setAvailableAlumni(availableAlumni.filter(a => a.id !== selectedAlumni));
      setSelectedAlumni('');
      setAddToWaitlistModalOpen(false);

      notifications.show({
        title: 'Success',
        message: `${alumni.firstName} ${alumni.lastName} added to waitlist`,
        color: 'green'
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add to waitlist',
        color: 'red'
      });
    }
  };

  const handleNotifyWaitlist = async (waitlistEntry: WaitlistEntry) => {
    try {
      const updatedWaitlist = waitlist.map(w =>
        w.id === waitlistEntry.id ? { ...w, notified: true } : w
      );
      setWaitlist(updatedWaitlist);

      notifications.show({
        title: 'Success',
        message: 'Notification sent successfully',
        color: 'green'
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send notification',
        color: 'red'
      });
    }
  };

  const currentRegistrations = event.registrations?.filter(r => r.status === 'registered').length || 0;
  const hasAvailableSpots = currentRegistrations < event.capacity;

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
    <>
      <Paper p="md" withBorder>
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={3}>Waitlist Management</Title>
              <Text size="sm" c="dimmed">
                {waitlist.length} people on waitlist
              </Text>
            </div>
            
            <Group>
              {hasAvailableSpots && waitlist.length > 0 && (
                <Badge color="green" variant="light">
                  {event.capacity - currentRegistrations} spots available
                </Badge>
              )}
              
              <Button
                size="sm"
                leftSection={<IconUserPlus size={16} />}
                onClick={() => setAddToWaitlistModalOpen(true)}
                disabled={availableAlumni.length === 0}
              >
                Add to Waitlist
              </Button>
            </Group>
          </Group>

          {/* Waitlist Table */}
          {waitlist.length === 0 ? (
            <Alert icon={<IconAlertCircle />} title="No waitlist entries">
              No one is currently on the waitlist for this event.
            </Alert>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Position</Table.Th>
                  <Table.Th>Alumni</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Joined Waitlist</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {waitlist.map(entry => (
                  <Table.Tr key={entry.id}>
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        #{entry.position}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar
                          src={entry.profile?.profileImage}
                          alt={entry.profile ? `${entry.profile.firstName} ${entry.profile.lastName}` : 'Unknown'}
                          size="sm"
                        />
                        <div>
                          <Text size="sm" fw={500}>
                            {entry.profile 
                              ? `${entry.profile.firstName} ${entry.profile.lastName}`
                              : 'Unknown User'
                            }
                          </Text>
                          <Text size="xs" c="dimmed">
                            Class of {entry.profile?.graduationYear || 'N/A'}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {entry.profile?.currentCompany || 'N/A'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {entry.profile?.currentPosition || 'N/A'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {format(entry.joinedDate, 'PPP')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        <IconClock style={{ width: rem(12), height: rem(12), marginRight: rem(4) }} />
                        {format(entry.joinedDate, 'p')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={entry.notified ? 'green' : 'gray'}
                        variant="light"
                        size="sm"
                      >
                        {entry.notified ? 'Notified' : 'Pending'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots style={{ width: rem(16), height: rem(16) }} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {hasAvailableSpots && (
                            <Menu.Item
                              leftSection={<IconArrowUp style={{ width: rem(14), height: rem(14) }} />}
                              onClick={() => handlePromoteFromWaitlist(entry)}
                            >
                              Promote to Registration
                            </Menu.Item>
                          )}
                          
                          <Menu.Item
                            leftSection={<IconMail style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => handleNotifyWaitlist(entry)}
                            disabled={entry.notified}
                          >
                            Send Notification
                          </Menu.Item>
                          
                          <Menu.Item
                            color="red"
                            leftSection={<IconUserX style={{ width: rem(14), height: rem(14) }} />}
                            onClick={() => handleRemoveFromWaitlist(entry)}
                          >
                            Remove from Waitlist
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Add to Waitlist Modal */}
      <Modal
        opened={addToWaitlistModalOpen}
        onClose={() => setAddToWaitlistModalOpen(false)}
        title="Add to Waitlist"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select an alumni to add to the waitlist for this event.
          </Text>
          
          <select
            value={selectedAlumni}
            onChange={(e) => setSelectedAlumni(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">Select an alumni...</option>
            {availableAlumni.map(alumni => (
              <option key={alumni.id} value={alumni.id}>
                {alumni.firstName} {alumni.lastName} - Class of {alumni.graduationYear}
              </option>
            ))}
          </select>

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setAddToWaitlistModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToWaitlist} disabled={!selectedAlumni}>
              Add to Waitlist
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}