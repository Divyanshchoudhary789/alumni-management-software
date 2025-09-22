'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Image,
  Button,
  Badge,
  Divider,
  SimpleGrid,
  Card,
  Avatar,
  ActionIcon,
  Menu,
  rem,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconClock,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconDots,
  IconAlertCircle
} from '@tabler/icons-react';
import { Event, AlumniProfile } from '@/types';
import { EventStatusBadge, EventRegistrationModal, AttendeeManagement, WaitlistManagement } from '@/components/events';
import { mockEventService } from '@/lib/mock-services/eventService';
import { mockAlumniService } from '@/lib/mock-services/alumniService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setEventId(id);
    });
  }, [params]);

  const loadEventDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await mockEventService.getEventById(id);
      setEvent(eventResponse.data);

      // Load attendee details
      if (eventResponse.data.registrations.length > 0) {
        const alumniIds = eventResponse.data.registrations
          .filter(r => r.status === 'registered' || r.status === 'attended')
          .map(r => r.alumniId);
        
        // Get alumni details for attendees
        const alumniResponse = await mockAlumniService.getAlumni();
        const attendeeProfiles = alumniResponse.data.filter(alumni => 
          alumniIds.includes(alumni.id)
        );
        setAttendees(attendeeProfiles);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEventDetails(eventId);
    }
  }, [eventId]);

  const handleEdit = () => {
    if (eventId) {
      router.push(`/events/${eventId}/edit`);
    }
  };

  const handleDelete = () => {
    if (!event) return;

    modals.openConfirmModal({
      title: 'Delete Event',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{event.title}"? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          if (eventId) {
            await mockEventService.deleteEvent(eventId);
          }
          notifications.show({
            title: 'Success',
            message: 'Event deleted successfully',
            color: 'green'
          });
          router.push('/events');
        } catch (err: any) {
          notifications.show({
            title: 'Error',
            message: err.message || 'Failed to delete event',
            color: 'red'
          });
        }
      }
    });
  };

  const handleRegister = () => {
    setRegistrationModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (!event) return;

    try {
      await mockEventService.registerForEvent(event.id, 'mock_alumni_1');
      setIsRegistered(true);
      setRegistrationModalOpen(false);
      notifications.show({
        title: 'Success',
        message: `Successfully registered for ${event.title}`,
        color: 'green'
      });
      if (eventId) {
        loadEventDetails(eventId); // Reload to update registration count
      }
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to register for event',
        color: 'red'
      });
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle />} color="red" title="Error">
          {error || 'Event not found'}
        </Alert>
      </Container>
    );
  }

  const registeredCount = event.registrations.filter(r => r.status === 'registered').length;
  const attendedCount = event.registrations.filter(r => r.status === 'attended').length;
  const totalRegistrations = registeredCount + attendedCount;
  const capacityPercentage = (totalRegistrations / event.capacity) * 100;
  
  const isUpcoming = event.eventDate > new Date();
  const isPastDeadline = event.registrationDeadline < new Date();
  const isAtCapacity = totalRegistrations >= event.capacity;
  
  const canRegister = event.status === 'published' && 
                     isUpcoming && 
                     !isPastDeadline && 
                     !isAtCapacity;

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Group>
              <Title order={1}>{event.title}</Title>
              <EventStatusBadge status={event.status} />
            </Group>
            <Text c="dimmed" size="lg">
              {event.description}
            </Text>
          </Stack>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="light" size="lg">
                <IconDots style={{ width: rem(20), height: rem(20) }} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                onClick={handleEdit}
              >
                Edit Event
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                onClick={handleDelete}
              >
                Delete Event
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* Event Image and Details */}
          <Stack gap="md">
            <Image
              src={event.imageUrl}
              alt={event.title}
              height={300}
              radius="md"
              fallbackSrc="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
            />

            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Event Details</Title>
                
                <Group>
                  <IconCalendar style={{ width: rem(20), height: rem(20) }} />
                  <div>
                    <Text fw={500}>Date & Time</Text>
                    <Text size="sm" c="dimmed">
                      {format(event.eventDate, 'PPPP p')}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <IconMapPin style={{ width: rem(20), height: rem(20) }} />
                  <div>
                    <Text fw={500}>Location</Text>
                    <Text size="sm" c="dimmed">
                      {event.location}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <IconUsers style={{ width: rem(20), height: rem(20) }} />
                  <div>
                    <Text fw={500}>Capacity</Text>
                    <Text size="sm" c="dimmed">
                      {totalRegistrations} / {event.capacity} registered ({Math.round(capacityPercentage)}%)
                    </Text>
                  </div>
                </Group>

                <Group>
                  <IconClock style={{ width: rem(20), height: rem(20) }} />
                  <div>
                    <Text fw={500}>Registration Deadline</Text>
                    <Text size="sm" c={isPastDeadline ? 'red' : 'dimmed'}>
                      {format(event.registrationDeadline, 'PPP p')}
                      {isPastDeadline && ' (Closed)'}
                    </Text>
                  </div>
                </Group>

                {canRegister && (
                  <Button
                    leftSection={<IconUserPlus size={16} />}
                    onClick={handleRegister}
                    fullWidth
                  >
                    Register for Event
                  </Button>
                )}

                {isRegistered && (
                  <Alert color="green" title="Registration Confirmed">
                    You are registered for this event. We'll send you updates and reminders.
                  </Alert>
                )}

                {!canRegister && event.status === 'published' && (
                  <Alert color="orange" title="Registration Unavailable">
                    {isPastDeadline && 'Registration deadline has passed.'}
                    {isAtCapacity && !isPastDeadline && 'Event is at full capacity.'}
                    {!isUpcoming && 'This event has already occurred.'}
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Stack>

          {/* Attendees */}
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>
                  Attendees ({attendees.length})
                </Title>
                {event.status === 'completed' && (
                  <Badge color="blue" variant="light">
                    {attendedCount} attended
                  </Badge>
                )}
              </Group>

              {attendees.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No registrations yet
                </Text>
              ) : (
                <Stack gap="sm" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {attendees.map(attendee => {
                    const registration = event.registrations.find(r => r.alumniId === attendee.id);
                    return (
                      <Card key={attendee.id} p="sm" withBorder>
                        <Group>
                          <Avatar
                            src={attendee.profileImage}
                            alt={`${attendee.firstName} ${attendee.lastName}`}
                            size="md"
                          />
                          <div style={{ flex: 1 }}>
                            <Text fw={500} size="sm">
                              {attendee.firstName} {attendee.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {attendee.currentPosition} at {attendee.currentCompany}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Class of {attendee.graduationYear}
                            </Text>
                          </div>
                          <Badge
                            size="xs"
                            color={registration?.status === 'attended' ? 'green' : 'blue'}
                            variant="light"
                          >
                            {registration?.status === 'attended' ? 'Attended' : 'Registered'}
                          </Badge>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Paper>
        </SimpleGrid>

        {/* Admin Components - Only show for admin users */}
        <Stack gap="xl">
          <AttendeeManagement event={event} onEventUpdate={() => eventId && loadEventDetails(eventId)} />
          <WaitlistManagement event={event} onEventUpdate={() => eventId && loadEventDetails(eventId)} />
        </Stack>
      </Stack>

      {/* Registration Modal */}
      <EventRegistrationModal
        event={event}
        opened={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        isRegistered={isRegistered}
      />
    </Container>
  );
}