'use client';

import { useState, useMemo } from 'react';
import {
  Stack,
  Group,
  Button,
  Select,
  Pagination,
  Text,
  SimpleGrid,
  Center,
  Loader,
  Alert
} from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { Event } from '@/types';
import { EventCard } from './EventCard';
import { EventFilters, EventFilterValues } from './EventFilters';

interface EventListProps {
  events: Event[];
  loading?: boolean;
  error?: string;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (event: Event) => void;
  onEventView?: (event: Event) => void;
  onEventRegister?: (event: Event) => void;
  onCreateEvent?: () => void;
  showActions?: boolean;
  registeredEventIds?: string[];
}

const ITEMS_PER_PAGE = 12;

export function EventList({
  events,
  loading = false,
  error,
  onEventEdit,
  onEventDelete,
  onEventView,
  onEventRegister,
  onCreateEvent,
  showActions = true,
  registeredEventIds = []
}: EventListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('eventDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<EventFilterValues>({
    search: '',
    status: '',
    dateFrom: null,
    dateTo: null,
    location: ''
  });

  // Get unique locations for filter dropdown
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(events.map(event => event.location))];
    return uniqueLocations.sort();
  }, [events]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(event => event.eventDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(event => event.eventDate <= filters.dateTo!);
    }

    if (filters.location) {
      filtered = filtered.filter(event => event.location === filters.location);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Event];
      let bValue: any = b[sortBy as keyof Event];

      // Handle date sorting
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [events, filters, sortBy, sortOrder]);

  // Paginate events
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedEvents.slice(startIndex, endIndex);
  }, [filteredAndSortedEvents, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);

  const handleFiltersChange = (newFilters: EventFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: null,
      dateTo: null,
      location: ''
    });
    setCurrentPage(1);
  };

  const sortOptions = [
    { value: 'eventDate', label: 'Event Date' },
    { value: 'title', label: 'Title' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'capacity', label: 'Capacity' }
  ];

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle />} color="red" title="Error loading events">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={600}>
            Events ({filteredAndSortedEvents.length})
          </Text>
          <Text size="sm" c="dimmed">
            Manage and view alumni events
          </Text>
        </div>
        
        {onCreateEvent && (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreateEvent}>
            Create Event
          </Button>
        )}
      </Group>

      {/* Filters */}
      <EventFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        locations={locations}
      />

      {/* Sorting */}
      <Group>
        <Select
          label="Sort by"
          data={sortOptions}
          value={sortBy}
          onChange={(value) => setSortBy(value || 'eventDate')}
          w={150}
        />
        <Select
          label="Order"
          data={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' }
          ]}
          value={sortOrder}
          onChange={(value) => setSortOrder(value as 'asc' | 'desc' || 'asc')}
          w={120}
        />
      </Group>

      {/* Events Grid */}
      {paginatedEvents.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <Text size="lg" c="dimmed">
              No events found
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {filteredAndSortedEvents.length === 0 && events.length > 0
                ? 'Try adjusting your filters to see more events.'
                : 'No events have been created yet.'}
            </Text>
            {onCreateEvent && events.length === 0 && (
              <Button leftSection={<IconPlus size={16} />} onClick={onCreateEvent}>
                Create First Event
              </Button>
            )}
          </Stack>
        </Center>
      ) : (
        <>
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            spacing="md"
          >
            {paginatedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEventEdit}
                onDelete={onEventDelete}
                onView={onEventView}
                onRegister={onEventRegister}
                showActions={showActions}
                isRegistered={registeredEventIds.includes(event.id)}
              />
            ))}
          </SimpleGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                value={currentPage}
                onChange={setCurrentPage}
                total={totalPages}
                size="sm"
              />
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}