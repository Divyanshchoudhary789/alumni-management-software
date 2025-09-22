'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Event } from '@/types';
import { EventForm } from '@/components/events';
import { mockEventService } from '@/lib/mock-services/eventService';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface EventFormData {
  title: string;
  description: string;
  eventDate: Date | null;
  location: string;
  capacity: number;
  registrationDeadline: Date | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  imageUrl: string;
}

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (data: EventFormData) => {
    if (!data.eventDate || !data.registrationDeadline) {
      throw new Error('Event date and registration deadline are required');
    }

    setSubmitting(true);
    try {
      if (!eventId) throw new Error('Event ID not found');
      await mockEventService.updateEvent(eventId, {
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        location: data.location,
        capacity: data.capacity,
        registrationDeadline: data.registrationDeadline,
        status: data.status,
        imageUrl: data.imageUrl
      });

      notifications.show({
        title: 'Success',
        message: 'Event updated successfully',
        color: 'green'
      });

      router.push(`/events/${eventId}`);
    } catch (error: any) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (eventId) {
      router.push(`/events/${eventId}`);
    }
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle />} color="red" title="Error">
          {error || 'Event not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <EventForm
        event={event}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />
    </Container>
  );
}