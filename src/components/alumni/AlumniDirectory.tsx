'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Pagination,
  Loader,
  Center,
  ActionIcon,
  Collapse,
  NumberInput,
  Switch,
  Paper,
  Title,
  Divider,
  Avatar,
  Anchor,
  Tooltip,
  Box
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconUser,
  IconBriefcase,
  IconMapPin,
  IconSchool,
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconWorld,
  IconEye,
  IconEyeOff,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import { AlumniProfile } from '@/types';
import { mockAlumniService, AlumniFilters, AlumniSortOptions } from '@/lib/mock-services/alumniService';
import { PaginatedResponse } from '@/lib/mock-services/base';

interface AlumniDirectoryProps {
  onSelectAlumni?: (alumni: AlumniProfile) => void;
}

export function AlumniDirectory({ onSelectAlumni }: AlumniDirectoryProps) {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Filter states
  const [filters, setFilters] = useState<AlumniFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort states
  const [sortField, setSortField] = useState<keyof AlumniProfile>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter options (will be populated from data)
  const [filterOptions, setFilterOptions] = useState({
    graduationYears: [] as number[],
    degrees: [] as string[],
    locations: [] as string[],
    companies: [] as string[],
    skills: [] as string[]
  });

  // Load alumni data
  const loadAlumni = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const sortOptions: AlumniSortOptions = {
        field: sortField,
        direction: sortDirection
      };

      const currentFilters = {
        ...filters,
        search: searchQuery || undefined
      };

      const response: PaginatedResponse<AlumniProfile> = await mockAlumniService.getAlumni(
        currentFilters,
        sortOptions,
        page,
        pagination.limit
      );

      setAlumni(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alumni');
    } finally {
      setLoading(false);
    }
  };

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      const statsResponse = await mockAlumniService.getAlumniStats();
      const stats = statsResponse.data;

      setFilterOptions({
        graduationYears: Object.keys(stats.graduationYearDistribution)
          .map(Number)
          .sort((a, b) => b - a),
        degrees: [...new Set(alumni.map(a => a.degree))].sort(),
        locations: Object.keys(stats.locationDistribution).sort(),
        companies: stats.topCompanies.map(c => c.company),
        skills: stats.topSkills.map(s => s.skill)
      });
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  // Load data on component mount and when filters/sort change
  useEffect(() => {
    loadAlumni(1);
  }, [filters, sortField, sortDirection, searchQuery]);

  // Load filter options when component mounts
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof AlumniFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Handle sort change
  const handleSortChange = (field: keyof AlumniProfile) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadAlumni(page);
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (filters.graduationYear) count++;
    if (filters.degree) count++;
    if (filters.location) count++;
    if (filters.company) count++;
    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.isPublic !== undefined) count++;
    return count;
  }, [filters, searchQuery]);

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Alumni Directory</Title>
          <Text c="dimmed" size="sm">
            {pagination.total} alumni found
          </Text>
        </div>
        <Group>
          <Button
            variant="filled"
            leftSection={<IconUser size={16} />}
            component="a"
            href="/alumni/add"
          >
            Add Alumni
          </Button>
          <Button
            variant="light"
            leftSection={<IconFilter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
            rightSection={
              activeFilterCount > 0 ? (
                <Badge size="xs" color="blue" variant="filled">
                  {activeFilterCount}
                </Badge>
              ) : null
            }
          >
            Filters
            {showFilters ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </Button>
        </Group>
      </Group>

      {/* Search Bar */}
      <TextInput
        placeholder="Search alumni by name, company, position, or skills..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        mb="md"
        size="md"
      />

      {/* Filters Panel */}
      <Collapse in={showFilters}>
        <Paper p="md" mb="lg" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <NumberInput
                label="Graduation Year"
                placeholder="e.g. 2020"
                value={filters.graduationYear || ''}
                onChange={(value) => handleFilterChange('graduationYear', value)}
                min={1950}
                max={new Date().getFullYear()}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Select
                label="Degree"
                placeholder="Select degree"
                data={filterOptions.degrees}
                value={filters.degree || null}
                onChange={(value) => handleFilterChange('degree', value)}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Select
                label="Location"
                placeholder="Select location"
                data={filterOptions.locations}
                value={filters.location || null}
                onChange={(value) => handleFilterChange('location', value)}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Select
                label="Company"
                placeholder="Select company"
                data={filterOptions.companies}
                value={filters.company || null}
                onChange={(value) => handleFilterChange('company', value)}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <MultiSelect
                label="Skills"
                placeholder="Select skills"
                data={filterOptions.skills}
                value={filters.skills || []}
                onChange={(value) => handleFilterChange('skills', value)}
                clearable
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Switch
                label="Public profiles only"
                checked={filters.isPublic === true}
                onChange={(event) =>
                  handleFilterChange('isPublic', event.currentTarget.checked ? true : undefined)
                }
                mt="xl"
              />
            </Grid.Col>
          </Grid>
          <Group justify="space-between" mt="md">
            <Button variant="subtle" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <Text size="sm" c="dimmed">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </Text>
          </Group>
        </Paper>
      </Collapse>

      {/* Sort Options */}
      <Group mb="lg">
        <Text size="sm" c="dimmed">Sort by:</Text>
        <Group gap="xs">
          {[
            { field: 'lastName' as keyof AlumniProfile, label: 'Name' },
            { field: 'graduationYear' as keyof AlumniProfile, label: 'Graduation Year' },
            { field: 'currentCompany' as keyof AlumniProfile, label: 'Company' },
            { field: 'createdAt' as keyof AlumniProfile, label: 'Recently Added' }
          ].map(({ field, label }) => (
            <Button
              key={field}
              variant={sortField === field ? 'filled' : 'subtle'}
              size="xs"
              onClick={() => handleSortChange(field)}
              rightSection={
                sortField === field ? (
                  sortDirection === 'asc' ?
                    <IconSortAscending size={14} /> :
                    <IconSortDescending size={14} />
                ) : null
              }
            >
              {label}
            </Button>
          ))}
        </Group>
      </Group>

      {/* Loading State */}
      {loading && (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      )}

      {/* Error State */}
      {error && (
        <Center py="xl">
          <Text c="red">{error}</Text>
        </Center>
      )}

      {/* Alumni Grid */}
      {!loading && !error && (
        <>
          <Grid>
            {alumni.map((alumniProfile) => (
              <Grid.Col key={alumniProfile.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <AlumniCard
                  alumni={alumniProfile}
                  onClick={() => {
                    if (onSelectAlumni) {
                      onSelectAlumni(alumniProfile);
                    } else {
                      // Navigate to alumni profile page
                      window.location.href = `/alumni/${alumniProfile.id}`;
                    }
                  }}
                />
              </Grid.Col>
            ))}
          </Grid>

          {/* Empty State */}
          {alumni.length === 0 && (
            <Center py="xl">
              <Stack align="center">
                <IconUser size={48} color="gray" />
                <Text size="lg" c="dimmed">No alumni found</Text>
                <Text size="sm" c="dimmed">
                  Try adjusting your search criteria or filters
                </Text>
                <Button variant="light" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Stack>
            </Center>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Center mt="xl">
              <Pagination
                total={pagination.totalPages}
                value={pagination.page}
                onChange={handlePageChange}
                size="md"
              />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}

// Alumni Card Component
interface AlumniCardProps {
  alumni: AlumniProfile;
  onClick?: () => void;
}

function AlumniCard({ alumni, onClick }: AlumniCardProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ cursor: onClick ? 'pointer' : 'default', height: '100%' }}
      onClick={onClick}
    >
      <Stack gap="md">
        {/* Profile Header */}
        <Group>
          <Avatar
            src={alumni.profileImage}
            alt={`${alumni.firstName} ${alumni.lastName}`}
            size="lg"
            radius="md"
          />
          <div style={{ flex: 1 }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600} size="lg">
                  {alumni.firstName} {alumni.lastName}
                </Text>
                <Text size="sm" c="dimmed">
                  Class of {alumni.graduationYear}
                </Text>
              </div>
              {!alumni.isPublic && (
                <Tooltip label="Private Profile">
                  <IconEyeOff size={16} color="gray" />
                </Tooltip>
              )}
            </Group>
          </div>
        </Group>

        {/* Education */}
        <Group gap="xs">
          <IconSchool size={16} color="gray" />
          <Text size="sm">{alumni.degree}</Text>
        </Group>

        {/* Current Position */}
        {alumni.currentCompany && alumni.currentPosition && (
          <Group gap="xs">
            <IconBriefcase size={16} color="gray" />
            <div>
              <Text size="sm" fw={500}>{alumni.currentPosition}</Text>
              <Text size="xs" c="dimmed">{alumni.currentCompany}</Text>
            </div>
          </Group>
        )}

        {/* Location */}
        {alumni.location && (
          <Group gap="xs">
            <IconMapPin size={16} color="gray" />
            <Text size="sm">{alumni.location}</Text>
          </Group>
        )}

        {/* Bio */}
        {alumni.bio && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {alumni.bio}
          </Text>
        )}

        {/* Skills */}
        {alumni.skills.length > 0 && (
          <div>
            <Group gap="xs" mb="xs">
              {alumni.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="light" size="sm">
                  {skill}
                </Badge>
              ))}
              {alumni.skills.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{alumni.skills.length - 3} more
                </Badge>
              )}
            </Group>
          </div>
        )}

        <Divider />

        {/* Contact Links */}
        <Group justify="space-between">
          <Group gap="xs">
            {alumni.linkedinUrl && (
              <Tooltip label="LinkedIn">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  component="a"
                  href={alumni.linkedinUrl}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconBrandLinkedin size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {alumni.websiteUrl && (
              <Tooltip label="Website">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  component="a"
                  href={alumni.websiteUrl}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconWorld size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
          <Group gap="xs">
            {alumni.phone && (
              <Tooltip label="Phone">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  component="a"
                  href={`tel:${alumni.phone}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconPhone size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Email">
              <ActionIcon
                variant="subtle"
                size="sm"
                component="a"
                href={`mailto:${alumni.firstName.toLowerCase()}.${alumni.lastName.toLowerCase()}@example.com`}
                onClick={(e) => e.stopPropagation()}
              >
                <IconMail size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}