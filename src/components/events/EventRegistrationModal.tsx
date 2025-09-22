'use client';

import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  Alert,
  Divider,
  Badge,
  Image,
  rem
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconClock,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import { Event } from '@/types';
import { format } from 'date-fns';

interface EventRegistrationModalProps {
  event: Event | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isRegistered?: boolean;
}

export function EventRegistrationModal({
  event,
  opened,
  onClose,
  onConfirm,
  loading = false,
  isRegistered = false
}: EventRegistrationModalProps) {
  if (!event) return null;

  const registeredCount = event.registrations?.filter(r => r.status === 'registered').length || 0;
  const attendedCount = event.registrations?.filter(r => r.status === 'attended').length || 0;
  const totalRegistrations = registeredCount + attendedCount;
  const availableSpots = event.capacity - totalRegistrations;
  
  const isUpcoming = event.eventDate > new Date();
  const isPastDeadline = event.registrationDeadline < new Date();
  const isAtCapacity = totalRegistrations >= event.capacity;
  
  const canRegister = event.status === 'published' && 
                     isUpcoming && 
                     !isPastDeadline && 
                     !isAtCapacity && 
                     !isRegistered;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isRegistered ? 'Registration Confirmed' : 'Event Registration'}
      size="md"
      centered
    >
      <Stack gap="md">
        {/* Event Image */}
        <Image
          src={event.imageUrl}
          alt={event.title}
          height={150}
          radius="md"
          fallbackSrc="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
        />

        {/* Event Details */}
        <Stack gap="xs">
          <Text fw={600} size="lg">
            {event.title}
          </Text>
          
          <Group gap="xs">
            <IconCalendar style={{ width: rem(16), height: rem(16) }} />
            <Text size="sm">
              {format(event.eventDate, 'PPP p')}
            </Text>
          </Group>

          <Group gap="xs">
            <IconMapPin style={{ width: rem(16), height: rem(16) }} />
            <Text size="sm">
              {event.location}
            </Text>
          </Group>

          <Group gap="xs">
            <IconUsers style={{ width: rem(16), height: rem(16) }} />
            <Text size="sm">
              {availableSpots} of {event.capacity} spots available
            </Text>
          </Group>

          <Group gap="xs">
            <IconClock style={{ width: rem(16), height: rem(16) }} />
            <Text size="sm" c={isPastDeadline ? 'red' : 'dimmed'}>
              Registration deadline: {format(event.registrationDeadline, 'PPP')}
            </Text>
          </Group>
        </Stack>

        <Divider />

        {/* Registration Status */}
        {isRegistered ? (
          <Alert icon={<IconCheck />} color="green" title="Already Registered">
            You are already registered for this event. We'll send you updates and reminders as the event approaches.
          </Alert>
        ) : canRegister ? (
          <Alert color="blue" title="Confirm Registration">
            <Text size="sm">
              By registering for this event, you confirm your attendance. Please make sure you can attend before registering.
            </Text>
            {availableSpots <= 5 && (
              <Text size="sm" mt="xs" c="orange" fw={500}>
                Only {availableSpots} spots remaining!
              </Text>
            )}
          </Alert>
        ) : (
          <Alert icon={<IconAlertCircle />} color="red" title="Registration Unavailable">
            {isPastDeadline && 'Registration deadline has passed.'}
            {isAtCapacity && !isPastDeadline && 'This event is at full capacity.'}
            {!isUpcoming && 'This event has already occurred.'}
            {event.status !== 'published' && 'This event is not currently accepting registrations.'}
          </Alert>
        )}

        {/* Capacity Indicator */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Capacity
          </Text>
          <Group gap="xs">
            <Badge
              color={availableSpots <= 5 ? 'red' : availableSpots <= 15 ? 'yellow' : 'green'}
              variant="light"
              size="sm"
            >
              {totalRegistrations} / {event.capacity}
            </Badge>
          </Group>
        </Group>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={loading}>
            {isRegistered ? 'Close' : 'Cancel'}
          </Button>
          
          {!isRegistered && canRegister && (
            <Button onClick={onConfirm} loading={loading}>
              Confirm Registration
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}