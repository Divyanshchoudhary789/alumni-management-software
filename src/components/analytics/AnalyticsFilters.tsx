'use client';

import { 
  Card, 
  Group, 
  Select, 
  MultiSelect, 
  Button, 
  Text, 
  Collapse,
  ActionIcon,
  Badge,
  Stack
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconFilter, IconX, IconDownload, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { AnalyticsFilters as FilterType } from '@/lib/mock-services/analyticsService';

interface AnalyticsFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function AnalyticsFilters({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onRefresh,
  loading = false 
}: AnalyticsFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const graduationYearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const locationOptions = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC'
  ].map(location => ({ value: location, label: location }));

  const companyOptions = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Tesla', 'Netflix', 'Adobe',
    'Salesforce', 'Oracle', 'IBM', 'Intel', 'Cisco', 'Uber', 'Airbnb', 'Spotify',
    'Twitter', 'LinkedIn', 'Dropbox', 'Slack', 'Zoom', 'Shopify', 'Square', 'PayPal'
  ].map(company => ({ value: company, label: company }));

  const eventTypeOptions = [
    'Networking', 'Workshop', 'Social', 'Career', 'Fundraising', 'Alumni Reunion',
    'Professional Development', 'Mentorship', 'Volunteer', 'Sports'
  ].map(type => ({ value: type, label: type }));

  const donationPurposeOptions = [
    'General Fund', 'Scholarship Fund', 'Building Fund', 'Research Fund', 'Athletic Fund',
    'Library Fund', 'Emergency Fund', 'Student Activities', 'Faculty Support', 'Technology Fund'
  ].map(purpose => ({ value: purpose, label: purpose }));

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start && end) {
      onFiltersChange({
        ...filters,
        dateRange: { start, end }
      });
    } else {
      const { dateRange, ...restFilters } = filters;
      onFiltersChange(restFilters);
    }
  };

  const handleGraduationYearsChange = (years: string[]) => {
    if (years.length > 0) {
      onFiltersChange({
        ...filters,
        graduationYears: years.map(year => parseInt(year))
      });
    } else {
      const { graduationYears, ...restFilters } = filters;
      onFiltersChange(restFilters);
    }
  };

  const handleLocationsChange = (locations: string[]) => {
    if (locations.length > 0) {
      onFiltersChange({
        ...filters,
        locations
      });
    } else {
      const { locations, ...restFilters } = filters;
      onFiltersChange(restFilters);
    }
  };

  const handleCompaniesChange = (companies: string[]) => {
    if (companies.length > 0) {
      onFiltersChange({
        ...filters,
        companies
      });
    } else {
      const { companies, ...restFilters } = filters;
      onFiltersChange(restFilters);
    }
  };

  const handleEventTypesChange = (eventTypes: string[]) => {
    if (eventTypes.length > 0) {
      onFiltersChange({
        ...filters,
        eventTypes
      });
    } else {
      const { eventTypes, ...restFilters } = filters;
      onFiltersChange(restFilters);
    }
  };

  const handleDonationPurposesChange = (donationPurposes: string[]) => {
    if (donationPurposes.length > 0) {
      onFiltersChange({
        ...filters,
        donationPurposes
      });
    } else {
      const { donationPurposes, ...restFilters } = filters;
      onFiltersChange(restFilters);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange) count++;
    if (filters.graduationYears?.length) count++;
    if (filters.locations?.length) count++;
    if (filters.companies?.length) count++;
    if (filters.eventTypes?.length) count++;
    if (filters.donationPurposes?.length) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card withBorder radius="md" p="lg" mb="md">
      <Group justify="space-between" mb="md">
        <Group>
          <Button
            variant="light"
            leftSection={<IconFilter size={16} />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            rightSection={
              activeFiltersCount > 0 ? (
                <Badge size="sm" variant="filled" color="blue">
                  {activeFiltersCount}
                </Badge>
              ) : null
            }
          >
            Filters
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconX size={14} />}
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </Group>

        <Group>
          {onRefresh && (
            <ActionIcon
              variant="light"
              onClick={onRefresh}
              loading={loading}
              disabled={loading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          )}
          
          {onExport && (
            <Group gap="xs">
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={14} />}
                onClick={() => onExport('csv')}
                disabled={loading}
              >
                CSV
              </Button>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={14} />}
                onClick={() => onExport('excel')}
                disabled={loading}
              >
                Excel
              </Button>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={14} />}
                onClick={() => onExport('pdf')}
                disabled={loading}
              >
                PDF
              </Button>
            </Group>
          )}
        </Group>
      </Group>

      <Collapse in={filtersOpen}>
        <Stack gap="md">
          <Group grow>
            <DatePickerInput
              type="range"
              label="Date Range"
              placeholder="Select date range"
              value={filters.dateRange ? [filters.dateRange.start, filters.dateRange.end] : [null, null]}
              onChange={handleDateRangeChange}
              clearable
            />
          </Group>

          <Group grow>
            <MultiSelect
              label="Graduation Years"
              placeholder="Select graduation years"
              data={graduationYearOptions}
              value={filters.graduationYears?.map(year => year.toString()) || []}
              onChange={handleGraduationYearsChange}
              searchable
              clearable
              maxDropdownHeight={200}
            />

            <MultiSelect
              label="Locations"
              placeholder="Select locations"
              data={locationOptions}
              value={filters.locations || []}
              onChange={handleLocationsChange}
              searchable
              clearable
              maxDropdownHeight={200}
            />
          </Group>

          <Group grow>
            <MultiSelect
              label="Companies"
              placeholder="Select companies"
              data={companyOptions}
              value={filters.companies || []}
              onChange={handleCompaniesChange}
              searchable
              clearable
              maxDropdownHeight={200}
            />

            <MultiSelect
              label="Event Types"
              placeholder="Select event types"
              data={eventTypeOptions}
              value={filters.eventTypes || []}
              onChange={handleEventTypesChange}
              searchable
              clearable
              maxDropdownHeight={200}
            />
          </Group>

          <Group grow>
            <MultiSelect
              label="Donation Purposes"
              placeholder="Select donation purposes"
              data={donationPurposeOptions}
              value={filters.donationPurposes || []}
              onChange={handleDonationPurposesChange}
              searchable
              clearable
              maxDropdownHeight={200}
            />
          </Group>
        </Stack>
      </Collapse>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Group mt="md" gap="xs">
          <Text size="sm" c="dimmed">Active filters:</Text>
          
          {filters.dateRange && (
            <Badge variant="light" color="blue">
              {filters.dateRange.start.toLocaleDateString()} - {filters.dateRange.end.toLocaleDateString()}
            </Badge>
          )}
          
          {filters.graduationYears?.map(year => (
            <Badge key={year} variant="light" color="green">
              Class of {year}
            </Badge>
          ))}
          
          {filters.locations?.map(location => (
            <Badge key={location} variant="light" color="orange">
              {location}
            </Badge>
          ))}
          
          {filters.companies?.map(company => (
            <Badge key={company} variant="light" color="purple">
              {company}
            </Badge>
          ))}
          
          {filters.eventTypes?.map(type => (
            <Badge key={type} variant="light" color="teal">
              {type}
            </Badge>
          ))}
          
          {filters.donationPurposes?.map(purpose => (
            <Badge key={purpose} variant="light" color="red">
              {purpose}
            </Badge>
          ))}
        </Group>
      )}
    </Card>
  );
}