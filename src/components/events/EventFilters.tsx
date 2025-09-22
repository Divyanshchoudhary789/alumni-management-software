'use client';

import {
  Paper,
  Group,
  TextInput,
  Select,
  Button,
  Stack,
  Collapse,
  ActionIcon,
  rem
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconFilter, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { Event } from '@/types';

export interface EventFilterValues {
  search: string;
  status: Event['status'] | '';
  dateFrom: Date | null;
  dateTo: Date | null;
  location: string;
}

interface EventFiltersProps {
  filters: EventFilterValues;
  onFiltersChange: (filters: EventFilterValues) => void;
  onClearFilters: () => void;
  locations?: string[];
}

export function EventFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  locations = []
}: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof EventFilterValues, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.search || 
                          filters.status || 
                          filters.dateFrom || 
                          filters.dateTo || 
                          filters.location;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    ...locations.map(location => ({ value: location, label: location }))
  ];

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group>
          <TextInput
            placeholder="Search events..."
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ flex: 1 }}
          />
          
          <Button
            variant="light"
            leftSection={<IconFilter style={{ width: rem(16), height: rem(16) }} />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Filters
          </Button>

          {hasActiveFilters && (
            <ActionIcon
              variant="light"
              color="red"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              <IconX style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
          )}
        </Group>

        <Collapse in={showAdvanced}>
          <Stack gap="md">
            <Group grow>
              <Select
                label="Status"
                placeholder="Select status"
                data={statusOptions}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                clearable
              />

              <Select
                label="Location"
                placeholder="Select location"
                data={locationOptions}
                value={filters.location}
                onChange={(value) => handleFilterChange('location', value)}
                clearable
                searchable
              />
            </Group>

            <Group grow>
              <DatePickerInput
                label="From Date"
                placeholder="Select start date"
                value={filters.dateFrom}
                onChange={(value) => handleFilterChange('dateFrom', value)}
                clearable
              />

              <DatePickerInput
                label="To Date"
                placeholder="Select end date"
                value={filters.dateTo}
                onChange={(value) => handleFilterChange('dateTo', value)}
                clearable
                minDate={filters.dateFrom || undefined}
              />
            </Group>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}