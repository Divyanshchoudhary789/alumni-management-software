'use client';

import { useState, useMemo } from 'react';
import {
  Paper,
  Group,
  ActionIcon,
  Text,
  Stack,
  Badge,
  Tooltip,
  rem,
  Box,
  ScrollArea,
} from '@mantine/core';
import { Calendar } from '@mantine/dates';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
} from '@tabler/icons-react';
import { Event } from '@/types';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';
import { EventStatusBadge } from './EventStatusBadge';

interface EventCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateSelect?: (date: Date) => void;
}

export function EventCalendar({
  events,
  onEventClick,
  onDateSelect,
}: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};

    events.forEach(event => {
      const dateKey = format(event.eventDate, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  }, [eventsByDate, selectedDate]);

  // Custom day renderer to show event indicators
  const renderDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    const hasEvents = dayEvents.length > 0;

    return (
      <Tooltip
        label={
          hasEvents
            ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`
            : ''
        }
        disabled={!hasEvents}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {hasEvents && (
            <Box
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--mantine-color-blue-6)',
                zIndex: 1,
              }}
            />
          )}
        </div>
      </Tooltip>
    );
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  return (
    <Group align="flex-start" gap="md" wrap="nowrap">
      {/* Calendar */}
      <Paper p="md" withBorder style={{ minWidth: 320 }}>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500} size="lg">
              <IconCalendar
                style={{ width: rem(20), height: rem(20), marginRight: rem(8) }}
              />
              Event Calendar
            </Text>
          </Group>

          <Calendar
            value={selectedDate}
            onChange={handleDateChange}
            date={viewDate}
            onDateChange={setViewDate}
            renderDay={renderDay}
            size="md"
            firstDayOfWeek={0}
          />

          <Group justify="center" gap="xs">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--mantine-color-blue-6)',
              }}
            />
            <Text size="xs" c="dimmed">
              Has events
            </Text>
          </Group>
        </Stack>
      </Paper>

      {/* Selected Date Events */}
      <Paper p="md" withBorder style={{ flex: 1, minHeight: 400 }}>
        <Stack gap="md">
          <Text fw={500} size="lg">
            Events on {format(selectedDate, 'PPPP')}
          </Text>

          {selectedDateEvents.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No events scheduled for this date
            </Text>
          ) : (
            <ScrollArea style={{ height: 320 }}>
              <Stack gap="sm">
                {selectedDateEvents.map(event => (
                  <Paper
                    key={event.id}
                    p="sm"
                    withBorder
                    style={{ cursor: onEventClick ? 'pointer' : 'default' }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Text fw={500} size="sm" lineClamp={2}>
                          {event.title}
                        </Text>
                        <EventStatusBadge status={event.status} size="xs" />
                      </Group>

                      <Text size="xs" c="dimmed">
                        {format(event.eventDate, 'p')} • {event.location}
                      </Text>

                      <Text size="xs" lineClamp={2}>
                        {event.description}
                      </Text>

                      <Group gap="xs">
                        <Badge size="xs" variant="light">
                          {event.registrations?.filter(
                            r => r.status === 'registered'
                          ).length || 0}{' '}
                          / {event.capacity}
                        </Badge>
                        {event.registrationDeadline < new Date() &&
                          event.status === 'published' && (
                            <Badge size="xs" color="red" variant="light">
                              Registration Closed
                            </Badge>
                          )}
                      </Group>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          )}
        </Stack>
      </Paper>
    </Group>
  );
}
