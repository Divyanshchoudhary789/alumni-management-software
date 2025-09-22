'use client';

import {
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Progress,
  ActionIcon,
  Menu,
  rem,
  Tooltip
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconClock
} from '@tabler/icons-react';
import { Event } from '@/types';
import { EventStatusBadge } from './EventStatusBadge';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onView?: (event: Event) => void;
  onRegister?: (event: Event) => void;
  showActions?: boolean;
  isRegistered?: boolean;
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  onView,
  onRegister,
  showActions = true,
  isRegistered = false
}: EventCardProps) {
  const registeredCount = event.registrations?.filter(r => r.status === 'registered').length || 0;
  const attendedCount = event.registrations?.filter(r => r.status === 'attended').length || 0;
  const totalRegistrations = registeredCount + attendedCount;
  const capacityPercentage = (totalRegistrations / event.capacity) * 100;
  
  const isUpcoming = event.eventDate > new Date();
  const isPastDeadline = event.registrationDeadline < new Date();
  const isAtCapacity = totalRegistrations >= event.capacity;
  
  const canRegister = event.status === 'published' && 
                     isUpcoming && 
                     !isPastDeadline && 
                     !isAtCapacity && 
                     !isRegistered;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={event.imageUrl}
          height={200}
          alt={event.title}
          fallbackSrc="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
        />
      </Card.Section>

      <Stack gap="sm" mt="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} size="lg" lineClamp={2}>
            {event.title}
          </Text>
          {showActions && (
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {onView && (
                  <Menu.Item
                    leftSection={<IconEye style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => onView(event)}
                  >
                    View Details
                  </Menu.Item>
                )}
                {onEdit && (
                  <Menu.Item
                    leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => onEdit(event)}
                  >
                    Edit Event
                  </Menu.Item>
                )}
                {onDelete && (
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => onDelete(event)}
                  >
                    Delete Event
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        <Group justify="space-between">
          <EventStatusBadge status={event.status} />
          {isRegistered && (
            <Badge color="blue" variant="light" size="sm">
              Registered
            </Badge>
          )}
        </Group>

        <Text size="sm" c="dimmed" lineClamp={3}>
          {event.description}
        </Text>

        <Stack gap="xs">
          <Group gap="xs">
            <IconCalendar style={{ width: rem(16), height: rem(16) }} />
            <Text size="sm">
              {format(event.eventDate, 'PPP p')}
            </Text>
          </Group>

          <Group gap="xs">
            <IconMapPin style={{ width: rem(16), height: rem(16) }} />
            <Text size="sm" lineClamp={1}>
              {event.location}
            </Text>
          </Group>

          <Group gap="xs">
            <IconUsers style={{ width: rem(16), height: rem(16) }} />
            <Text size="sm">
              {totalRegistrations} / {event.capacity} registered
            </Text>
          </Group>

          {event.status === 'published' && (
            <Group gap="xs">
              <IconClock style={{ width: rem(16), height: rem(16) }} />
              <Text size="sm" c={isPastDeadline ? 'red' : 'dimmed'}>
                Registration deadline: {format(event.registrationDeadline, 'PPP')}
              </Text>
            </Group>
          )}
        </Stack>

        {event.status === 'published' && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Capacity
              </Text>
              <Text size="xs" c="dimmed">
                {Math.round(capacityPercentage)}%
              </Text>
            </Group>
            <Progress 
              value={capacityPercentage} 
              color={capacityPercentage > 90 ? 'red' : capacityPercentage > 70 ? 'yellow' : 'blue'}
              size="sm"
            />
          </Stack>
        )}

        {onRegister && event.status === 'published' && (
          <Group justify="space-between" mt="md">
            <div>
              {isPastDeadline && (
                <Text size="xs" c="red">Registration closed</Text>
              )}
              {isAtCapacity && !isPastDeadline && (
                <Text size="xs" c="orange">Event at capacity</Text>
              )}
            </div>
            
            <Button
              variant={isRegistered ? "light" : "filled"}
              color={isRegistered ? "gray" : "blue"}
              disabled={!canRegister || isRegistered}
              onClick={() => onRegister(event)}
              size="sm"
            >
              {isRegistered ? 'Registered' : 'Register'}
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
}