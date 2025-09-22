'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Alert,
  Loader,
  Center,
  Button,
  Group,
  Text
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { Event } from '@/types';
import { EventCheckIn } from '@/components/events';
import { mockEventService } from '@/lib/mock-services/eventService';
import { useRouter } from 'next/navigation';

interface CheckInPageProps {
  params: Promise<{ id: string }>;
}

export default function CheckInPage({ params }: CheckInPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setEventId(id);
    });
  }, [params]);

  const loadEvent = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockEventService.getEventById(id);
      setEvent(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
    }
  }, [eventId]);

  const handleCheckInUpdate = () => {
    if (eventId) {
      loadEvent(eventId); // Reload event data to update counts
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

  return (
    <Container size="xl" py="xl">
      <Group mb="xl">
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => eventId && router.push(`/events/${eventId}`)}
        >
          Back to Event
        </Button>
      </Group>

      <EventCheckIn event={event} onCheckInUpdate={handleCheckInUpdate} />
    </Container>
  );
}