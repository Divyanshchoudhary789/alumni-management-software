'use client';

import { Container } from '@mantine/core';
import { EventForm } from '@/components/events';
import { eventsApiService } from '@/services/api';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    if (!data.eventDate || !data.registrationDeadline) {
      throw new Error('Event date and registration deadline are required');
    }

    setLoading(true);
    try {
      await eventsApiService.createEvent({
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
        message: 'Event created successfully',
        color: 'green',
      });

      router.push('/events');
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/events');
  };

  return (
    <Container size="md" py="xl">
      <EventForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Container>
  );
}
