'use client';

import { useState, useEffect } from 'react';
import { Container, LoadingOverlay, Alert } from '@mantine/core';
import { useRouter, useParams } from 'next/navigation';
import { EventForm } from '@/components/events';
import { eventsApiService } from '@/services/api';
import { notifications } from '@mantine/notifications';
import { Event } from '@/types';
import { IconAlertCircle } from '@tabler/icons-react';

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

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const response = await eventsApiService.getEventById(eventId);
        setEvent(response);
      } catch (err: any) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const handleSubmit = async (data: EventFormData) => {
    if (!data.eventDate || !data.registrationDeadline) {
      throw new Error('Event date and registration deadline are required');
    }

    setSubmitting(true);
    try {
      await eventsApiService.updateEvent(eventId, {
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        location: data.location,
        capacity: data.capacity,
        registrationDeadline: data.registrationDeadline,
        status: data.status,
        imageUrl: data.imageUrl,
      });

      notifications.show({
        title: 'Success',
        message: 'Event updated successfully',
        color: 'green',
      });

      router.push('/events');
    } catch (error: any) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/events');
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <LoadingOverlay visible />
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
