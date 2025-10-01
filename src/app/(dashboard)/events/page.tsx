'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Tabs,
  rem,
  Alert,
  Modal,
  Button,
  Group,
  Text,
  SegmentedControl,
  Stack,
  Title,
  Badge,
} from '@mantine/core';
import {
  IconList,
  IconCalendar,
  IconAlertCircle,
  IconTrash,
  IconFilter,
} from '@tabler/icons-react';
import { Event } from '@/types';
import {
  EventList,
  EventCalendar,
  EventRegistrationModal,
} from '@/components/events';
import { mockEventService } from '@/lib/mock-services/eventService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading events from mock API...');
      const response = await mockEventService.getEvents({}, undefined, 1, 100); // Get all events
      console.log('Events mock response:', response);
      setEvents(response.data || []);
    } catch (err: any) {
      console.error('Events loading error:', err);
      setError(err.message || 'Failed to load events');
      notifications.show({
        title: 'Error',
        message: 'Failed to load events',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on type
  const filteredEvents = events.filter(event => {
    if (eventTypeFilter === 'all') return true;
    return event.eventType === eventTypeFilter;
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleEventView = (event: Event) => {
    router.push(`/events/${event.id}`);
  };

  const handleEventEdit = (event: Event) => {
    router.push(`/events/${event.id}/edit`);
  };

  const handleEventDelete = (event: Event) => {
    modals.openConfirmModal({
      title: 'Delete Event',
      children: (
        <Text size="sm">
          Are you sure you want to delete "{event.title}"? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await mockEventService.deleteEvent(event.id);
          notifications.show({
            title: 'Success',
            message: 'Event deleted successfully',
            color: 'green',
          });
          loadEvents(); // Reload events
        } catch (err: any) {
          notifications.show({
            title: 'Error',
            message: err.message || 'Failed to delete event',
            color: 'red',
          });
        }
      },
    });
  };

  const handleEventRegister = (event: Event) => {
    setSelectedEvent(event);
    setRegistrationModalOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedEvent) return;

    try {
      await mockEventService.registerForEvent(selectedEvent.id, 'current_user'); // Mock user ID
      setRegistrationModalOpen(false);
      setSelectedEvent(null);
      notifications.show({
        title: 'Success',
        message: `Successfully registered for ${selectedEvent.title}`,
        color: 'green',
      });
      loadEvents(); // Reload to update registration counts
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to register for event',
        color: 'red',
      });
    }
  };

  const handleDateSelect = (date: Date) => {
    // Could implement filtering by selected date
    console.log('Selected date:', date);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header with filters */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Events</Title>
            <Text c="dimmed">Discover and register for alumni events</Text>
          </div>
          <Group gap="md">
            <Group gap="xs">
              <IconFilter size={16} />
              <Text size="sm" fw={500}>Filter:</Text>
            </Group>
            <SegmentedControl
              value={eventTypeFilter}
              onChange={value => setEventTypeFilter(value as 'all' | 'free' | 'paid')}
              data={[
                { label: 'All Events', value: 'all' },
                { label: 'Free Events', value: 'free' },
                { label: 'Paid Events', value: 'paid' },
              ]}
              size="sm"
            />
          </Group>
        </Group>

        {/* Event counts */}
        <Group gap="md">
          <Badge size="lg" variant="light" color="blue">
            Total: {events.length}
          </Badge>
          <Badge size="lg" variant="light" color="green">
            Free: {events.filter(e => e.eventType === 'free').length}
          </Badge>
          <Badge size="lg" variant="light" color="orange">
            Paid: {events.filter(e => e.eventType === 'paid').length}
          </Badge>
        </Group>

        <Tabs value={activeTab} onChange={value => setActiveTab(value || 'list')}>
          <Tabs.List>
            <Tabs.Tab
              value="list"
              leftSection={
                <IconList style={{ width: rem(16), height: rem(16) }} />
              }
            >
              Event List ({filteredEvents.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="calendar"
              leftSection={
                <IconCalendar style={{ width: rem(16), height: rem(16) }} />
              }
            >
              Calendar View
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="list" pt="md">
            <EventList
              events={filteredEvents}
              loading={loading}
              error={error || undefined}
              onEventEdit={handleEventEdit}
              onEventDelete={handleEventDelete}
              onEventView={handleEventView}
              onEventRegister={handleEventRegister}
              onCreateEvent={handleCreateEvent}
              showActions={true}
              registeredEventIds={[]} // TODO: Get from user's registrations
            />
          </Tabs.Panel>

          <Tabs.Panel value="calendar" pt="md">
            <EventCalendar
              events={filteredEvents}
              onEventClick={handleEventView}
              onDateSelect={handleDateSelect}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Registration Modal */}
      <EventRegistrationModal
        event={selectedEvent}
        opened={registrationModalOpen}
        onClose={() => {
          setRegistrationModalOpen(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleConfirmRegistration}
      />
    </Container>
  );
}
