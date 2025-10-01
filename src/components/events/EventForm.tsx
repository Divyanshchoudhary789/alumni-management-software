'use client';

import { useState } from 'react';
import {
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Group,
  Paper,
  Title,
  Alert,
  FileInput,
  Image,
  Box,
  Text,
  rem,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconUpload,
  IconAlertCircle,
  IconCalendar,
  IconMapPin,
} from '@tabler/icons-react';
import { Event } from '@/types';
import { notifications } from '@mantine/notifications';
import { eventsApiService } from '@/services/api';

interface EventFormData {
  title: string;
  description: string;
  eventDate: Date | null;
  location: string;
  capacity: number;
  registrationDeadline: Date | null;
  status: Event['status'];
  imageUrl: string;
}

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function EventForm({
  event,
  onSubmit,
  onCancel,
  loading = false,
}: EventFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    event?.imageUrl || ''
  );

  const form = useForm<EventFormData>({
    initialValues: {
      title: event?.title || '',
      description: event?.description || '',
      eventDate: event?.eventDate || null,
      location: event?.location || '',
      capacity: event?.capacity || 50,
      registrationDeadline: event?.registrationDeadline || null,
      status: event?.status || 'draft',
      imageUrl: event?.imageUrl || '',
    },
    validate: {
      title: value => (!value ? 'Event title is required' : null),
      description: value => (!value ? 'Event description is required' : null),
      eventDate: value => (!value ? 'Event date is required' : null),
      location: value => (!value ? 'Event location is required' : null),
      capacity: value => (value < 1 ? 'Capacity must be at least 1' : null),
      registrationDeadline: (value, values) => {
        if (!value) return 'Registration deadline is required';
        if (values.eventDate && value >= values.eventDate) {
          return 'Registration deadline must be before event date';
        }
        return null;
      },
    },
  });

  const handleImageUpload = (file: File | null) => {
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setFieldValue('imageUrl', result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
      form.setFieldValue('imageUrl', '');
    }
  };

  const handleSubmit = async (values: EventFormData) => {
    try {
      // Validate dates
      if (
        values.eventDate &&
        values.eventDate <= new Date() &&
        values.status === 'published'
      ) {
        notifications.show({
          title: 'Validation Error',
          message: 'Published events must have a future date',
          color: 'red',
        });
        return;
      }

      await onSubmit(values);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to save event',
        color: 'red',
      });
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' },
  ];

  const locationSuggestions = [
    'Campus Alumni Center',
    'Downtown Conference Center',
    'Virtual Event (Zoom)',
    'Hotel Ballroom',
    'Restaurant Private Room',
    'Company Office',
    'Community Center',
  ];

  return (
    <Paper p="xl" withBorder>
      <Stack gap="lg">
        <Title order={2}>{event ? 'Edit Event' : 'Create New Event'}</Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Basic Information */}
            <TextInput
              label="Event Title"
              placeholder="Enter event title"
              required
              {...form.getInputProps('title')}
            />

            <Textarea
              label="Description"
              placeholder="Describe the event"
              required
              minRows={4}
              {...form.getInputProps('description')}
            />

            {/* Date and Time */}
            <Group grow>
              <DateTimePicker
                label="Event Date & Time"
                placeholder="Select date and time"
                required
                leftSection={
                  <IconCalendar style={{ width: rem(16), height: rem(16) }} />
                }
                minDate={new Date()}
                {...form.getInputProps('eventDate')}
              />

              <DateTimePicker
                label="Registration Deadline"
                placeholder="Select deadline"
                required
                leftSection={
                  <IconCalendar style={{ width: rem(16), height: rem(16) }} />
                }
                minDate={new Date()}
                maxDate={form.values.eventDate || undefined}
                {...form.getInputProps('registrationDeadline')}
              />
            </Group>

            {/* Location and Capacity */}
            <Group grow>
              <Select
                label="Location"
                placeholder="Select or enter location"
                required
                searchable
                data={locationSuggestions}
                leftSection={
                  <IconMapPin style={{ width: rem(16), height: rem(16) }} />
                }
                {...form.getInputProps('location')}
              />

              <NumberInput
                label="Capacity"
                placeholder="Maximum attendees"
                required
                min={1}
                max={1000}
                {...form.getInputProps('capacity')}
              />
            </Group>

            {/* Status */}
            <Select
              label="Status"
              placeholder="Select event status"
              required
              data={statusOptions}
              {...form.getInputProps('status')}
            />

            {/* Image Upload */}
            <Stack gap="sm">
              <Text size="sm" fw={500}>
                Event Image
              </Text>

              <FileInput
                placeholder="Upload event image"
                accept="image/*"
                leftSection={
                  <IconUpload style={{ width: rem(16), height: rem(16) }} />
                }
                onChange={handleImageUpload}
                clearable
              />

              {imagePreview && (
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">
                    Image Preview:
                  </Text>
                  <Image
                    src={imagePreview}
                    alt="Event preview"
                    height={200}
                    width="100%"
                    fit="cover"
                    radius="md"
                  />
                </Box>
              )}
            </Stack>

            {/* Validation Warnings */}
            {form.values.status === 'published' &&
              form.values.eventDate &&
              form.values.eventDate <= new Date() && (
                <Alert
                  icon={<IconAlertCircle />}
                  color="orange"
                  title="Date Warning"
                >
                  Published events should have a future date. Consider changing
                  the status to draft or updating the date.
                </Alert>
              )}

            {form.values.registrationDeadline &&
              form.values.eventDate &&
              form.values.registrationDeadline >= form.values.eventDate && (
                <Alert
                  icon={<IconAlertCircle />}
                  color="red"
                  title="Deadline Error"
                >
                  Registration deadline must be before the event date.
                </Alert>
              )}

            {/* Form Actions */}
            <Group justify="flex-end" mt="xl">
              <Button variant="light" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {event ? 'Update Event' : 'Create Event'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
