'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Button,
  Card,
  Text,
  Title,
  Badge,
  Grid,
  Select,
  TextInput,
  Textarea,
  Modal,
  Alert,
  Progress,
  Avatar,
  ActionIcon,
  Tooltip,
  Tabs,
  SimpleGrid,
  ThemeIcon,
  LoadingOverlay,
} from '@mantine/core';
import {
  IconSearch,
  IconUserPlus,
  IconUsers,
  IconStar,
  IconCheck,
  IconEye,
  IconBrain,
  IconInfoCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { mockMentorshipService } from '@/lib/mock-services/mentorshipService';
import { alumniProfileService } from '@/services/alumniProfileService';

export function MentorMatching() {
  const [activeTab, setActiveTab] = useState<string>('requests');
  const [menteeRequests, setMenteeRequests] = useState<any[]>([]);
  const [mentorProfiles, setMentorProfiles] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);

  const [matchModalOpened, { open: openMatchModal, close: closeMatchModal }] =
    useDisclosure(false);
  const [
    requestModalOpened,
    { open: openRequestModal, close: closeRequestModal },
  ] = useDisclosure(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestsResponse, mentorsResponse, alumniResponse] =
        await Promise.all([
          mockMentorshipService.getMenteeRequests(),
          mockMentorshipService.getMentorProfiles(),
          alumniProfileService.getAlumni(),
        ]);

      setMenteeRequests(requestsResponse.data);
      setMentorProfiles(mentorsResponse.data);
      setAlumni(alumniResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load matching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAlumniName = (alumniId: string) => {
    const alumnus = alumni.find(a => a.id === alumniId);
    return alumnus
      ? `${alumnus.firstName} ${alumnus.lastName}`
      : `Alumni #${alumniId}`;
  };

  const getAlumniDetails = (alumniId: string) => {
    return alumni.find(a => a.id === alumniId);
  };

  const handleViewMatches = async (request: any) => {
    try {
      setSelectedRequest(request);
      const matchesResponse = await mockMentorshipService.suggestMentorMatches(
        request.id
      );
      setSuggestedMatches(matchesResponse.data);
      openMatchModal();
    } catch (err: any) {
      setError(err.message || 'Failed to load suggested matches');
    }
  };

  const handleCreateConnection = async (mentorId: string, menteeId: string) => {
    try {
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000
      ); // 6 months

      await mockMentorshipService.createMentorshipConnection({
        mentorId,
        menteeId,
        status: 'pending',
        startDate,
        endDate,
        notes: 'Connection created through matching system',
      });

      // Update request status
      // In a real app, you'd have an API to update the request
      loadData();
      closeMatchModal();
    } catch (err: any) {
      setError(err.message || 'Failed to create connection');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'matched':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'green';
      case 'Limited':
        return 'yellow';
      case 'Unavailable':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap="md">
      {error && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Mentor Matching System</Title>
          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              onClick={loadData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={openRequestModal}
            >
              New Request
            </Button>
          </Group>
        </Group>

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'requests')}>
          <Tabs.List>
            <Tabs.Tab value="requests" leftSection={<IconUsers size={16} />}>
              Mentee Requests (
              {menteeRequests.filter(r => r.status === 'pending').length})
            </Tabs.Tab>
            <Tabs.Tab value="free-mentors" leftSection={<IconStar size={16} />}>
              Free Mentors (
              {
                mentorProfiles.filter(
                  m => m.isActive && m.currentMentees < m.maxMentees &&
                  (m.mentorshipType === 'free' || m.mentorshipType === 'both')
                ).length
              }
              )
            </Tabs.Tab>
            <Tabs.Tab value="paid-mentors" leftSection={<IconStar size={16} />}>
              Paid Mentors (
              {
                mentorProfiles.filter(
                  m => m.isActive && m.currentMentees < m.maxMentees &&
                  (m.mentorshipType === 'paid' || m.mentorshipType === 'both')
                ).length
              }
              )
            </Tabs.Tab>
          </Tabs.List>

          <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />

            <Tabs.Panel value="requests" pt="md">
              <MenteeRequestsPanel
                requests={menteeRequests}
                alumni={alumni}
                onViewMatches={handleViewMatches}
                getAlumniName={getAlumniName}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
              />
            </Tabs.Panel>

            <Tabs.Panel value="free-mentors" pt="md">
              <MentorProfilesPanel
                mentors={mentorProfiles.filter(m =>
                  m.isActive && m.currentMentees < m.maxMentees &&
                  (m.mentorshipType === 'free' || m.mentorshipType === 'both')
                )}
                alumni={alumni}
                getAlumniName={getAlumniName}
                getAlumniDetails={getAlumniDetails}
                getAvailabilityColor={getAvailabilityColor}
                mentorshipType="free"
              />
            </Tabs.Panel>

            <Tabs.Panel value="paid-mentors" pt="md">
              <MentorProfilesPanel
                mentors={mentorProfiles.filter(m =>
                  m.isActive && m.currentMentees < m.maxMentees &&
                  (m.mentorshipType === 'paid' || m.mentorshipType === 'both')
                )}
                alumni={alumni}
                getAlumniName={getAlumniName}
                getAlumniDetails={getAlumniDetails}
                getAvailabilityColor={getAvailabilityColor}
                mentorshipType="paid"
              />
            </Tabs.Panel>
          </div>
        </Tabs>
      </Card>

      {/* Match Suggestions Modal */}
      <Modal
        opened={matchModalOpened}
        onClose={closeMatchModal}
        title="Suggested Mentor Matches"
        size="lg"
      >
        {selectedRequest && (
          <Stack gap="md">
            <Card withBorder>
              <Title order={5} mb="sm">
                Mentee Request Details
              </Title>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} c="dimmed">
                    Mentee
                  </Text>
                  <Text>{getAlumniName(selectedRequest.alumniId)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} c="dimmed">
                    Requested Specializations
                  </Text>
                  <Text>
                    {selectedRequest.requestedSpecializations.join(', ')}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="sm" fw={500} c="dimmed">
                    Career Goals
                  </Text>
                  <Text size="sm">{selectedRequest.careerGoals}</Text>
                </Grid.Col>
              </Grid>
            </Card>

            <Title order={5}>Suggested Matches</Title>

            {suggestedMatches.length > 0 ? (
              <Stack gap="sm">
                {suggestedMatches.map((match, index) => {
                  const mentor = mentorProfiles.find(
                    m => m.alumniId === match.mentorId
                  );
                  const mentorAlumni = getAlumniDetails(match.mentorId);

                  return (
                    <Card key={match.mentorId} withBorder>
                      <Group justify="space-between">
                        <Group>
                          <Avatar size="md" />
                          <div>
                            <Text fw={500}>
                              {getAlumniName(match.mentorId)}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {mentorAlumni?.currentPosition} at{' '}
                              {mentorAlumni?.currentCompany}
                            </Text>
                            <Group gap="xs" mt="xs">
                              {mentor?.specializations
                                .slice(0, 3)
                                .map((spec: string) => (
                                  <Badge key={spec} size="xs" variant="light">
                                    {spec}
                                  </Badge>
                                ))}
                            </Group>
                          </div>
                        </Group>

                        <div style={{ textAlign: 'right' }}>
                          <Group gap="xs" mb="xs">
                            <ThemeIcon size="sm" variant="light" color="blue">
                              <IconBrain size={12} />
                            </ThemeIcon>
                            <Text size="sm" fw={500}>
                              {match.score}% Match
                            </Text>
                          </Group>
                          <Progress value={match.score} size="xs" mb="xs" />
                          <Group gap="xs">
                            <Button
                              size="xs"
                              leftSection={<IconCheck size={14} />}
                              onClick={() =>
                                handleCreateConnection(
                                  match.mentorId,
                                  selectedRequest.alumniId
                                )
                              }
                            >
                              Connect
                            </Button>
                            <ActionIcon size="sm" variant="light">
                              <IconEye size={14} />
                            </ActionIcon>
                          </Group>
                        </div>
                      </Group>

                      <Text size="xs" c="dimmed" mt="sm">
                        Match reasons: {match.matchReasons.join(', ')}
                      </Text>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Text ta="center" c="dimmed" py="xl">
                No suitable matches found
              </Text>
            )}
          </Stack>
        )}
      </Modal>

      {/* New Request Modal */}
      <Modal
        opened={requestModalOpened}
        onClose={closeRequestModal}
        title="Create Mentee Request"
        size="md"
      >
        <NewRequestForm
          alumni={alumni}
          onSave={() => {
            loadData();
            closeRequestModal();
          }}
          onCancel={closeRequestModal}
        />
      </Modal>
    </Stack>
  );
}

// Mentee Requests Panel Component
function MenteeRequestsPanel({
  requests,
  alumni,
  onViewMatches,
  getAlumniName,
  formatDate,
  getStatusColor,
}: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch =
      !searchQuery ||
      getAlumniName(request.alumniId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.requestedSpecializations.some((spec: string) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = !statusFilter || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Stack gap="md">
      <Group>
        <TextInput
          placeholder="Search requests..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by status"
          data={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'matched', label: 'Matched' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          value={statusFilter}
          onChange={value => setStatusFilter(value || '')}
          clearable
        />
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request: any) => (
            <Card key={request.id} withBorder>
              <Group justify="space-between" mb="sm">
                <Group>
                  <Avatar size="sm" />
                  <div>
                    <Text fw={500}>{getAlumniName(request.alumniId)}</Text>
                    <Text size="xs" c="dimmed">
                      Requested {formatDate(request.createdAt)}
                    </Text>
                  </div>
                </Group>
                <Badge color={getStatusColor(request.status)} size="sm">
                  {request.status}
                </Badge>
              </Group>

              <Stack gap="xs" mb="md">
                <div>
                  <Text size="sm" fw={500} c="dimmed">
                    Specializations
                  </Text>
                  <Group gap="xs">
                    {request.requestedSpecializations.map((spec: string) => (
                      <Badge key={spec} size="xs" variant="light">
                        {spec}
                      </Badge>
                    ))}
                  </Group>
                </div>

                <div>
                  <Text size="sm" fw={500} c="dimmed">
                    Career Goals
                  </Text>
                  <Text size="sm">{request.careerGoals}</Text>
                </div>

                <div>
                  <Text size="sm" fw={500} c="dimmed">
                    Time Commitment
                  </Text>
                  <Text size="sm">{request.timeCommitment}</Text>
                </div>
              </Stack>

              <Group justify="flex-end">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconBrain size={14} />}
                  onClick={() => onViewMatches(request)}
                  disabled={request.status !== 'pending'}
                >
                  Find Matches
                </Button>
              </Group>
            </Card>
          ))
        ) : (
          <Text ta="center" c="dimmed" py="xl" style={{ gridColumn: '1 / -1' }}>
            No mentee requests found
          </Text>
        )}
      </SimpleGrid>
    </Stack>
  );
}

// Mentor Profiles Panel Component
function MentorProfilesPanel({
  mentors,
  alumni,
  getAlumniName,
  getAlumniDetails,
  getAvailabilityColor,
  mentorshipType,
}: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [mentorshipTypeFilter, setMentorshipTypeFilter] = useState('');

  const filteredMentors = mentors.filter((mentor: any) => {
    const alumniDetails = getAlumniDetails(mentor.alumniId);
    const matchesSearch =
      !searchQuery ||
      getAlumniName(mentor.alumniId)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      mentor.specializations.some((spec: string) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (alumniDetails?.currentCompany &&
        alumniDetails.currentCompany
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesAvailability =
      !availabilityFilter || mentor.availability === availabilityFilter;

    const matchesMentorshipType =
      !mentorshipTypeFilter || mentor.mentorshipType === mentorshipTypeFilter ||
      (mentorshipTypeFilter === 'both' && mentor.mentorshipType === 'both');

    return matchesSearch && matchesAvailability && matchesMentorshipType;
  });

  return (
    <Stack gap="md">
      <Group>
        <TextInput
          placeholder="Search mentors..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by availability"
          data={[
            { value: '', label: 'All Availability' },
            { value: 'Available', label: 'Available' },
            { value: 'Limited', label: 'Limited' },
            { value: 'Unavailable', label: 'Unavailable' },
          ]}
          value={availabilityFilter}
          onChange={value => setAvailabilityFilter(value || '')}
          clearable
        />
        <Select
          placeholder="Filter by mentorship type"
          data={[
            { value: '', label: 'All Types' },
            { value: 'free', label: 'Free Only' },
            { value: 'paid', label: 'Paid Only' },
            { value: 'both', label: 'Free & Paid' },
          ]}
          value={mentorshipTypeFilter}
          onChange={value => setMentorshipTypeFilter(value || '')}
          clearable
        />
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor: any) => {
            const alumniDetails = getAlumniDetails(mentor.alumniId);

            return (
              <Card key={mentor.alumniId} withBorder>
                <Group justify="space-between" mb="sm">
                  <Group>
                    <Avatar size="md" />
                    <div>
                      <Text fw={500}>{getAlumniName(mentor.alumniId)}</Text>
                      <Text size="sm" c="dimmed">
                        {alumniDetails?.currentPosition} at{' '}
                        {alumniDetails?.currentCompany}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {mentor.yearsOfExperience} years experience
                      </Text>
                    </div>
                  </Group>
                  <Badge
                    color={getAvailabilityColor(mentor.availability)}
                    size="sm"
                  >
                    {mentor.availability}
                  </Badge>
                </Group>

                <Stack gap="xs" mb="md">
                  <div>
                    <Text size="sm" fw={500} c="dimmed">
                      Specializations
                    </Text>
                    <Group gap="xs">
                      {mentor.specializations
                        .slice(0, 3)
                        .map((spec: string) => (
                          <Badge key={spec} size="xs" variant="light">
                            {spec}
                          </Badge>
                        ))}
                      {mentor.specializations.length > 3 && (
                        <Badge size="xs" variant="light" color="gray">
                          +{mentor.specializations.length - 3} more
                        </Badge>
                      )}
                    </Group>
                  </div>

                  <div>
                    <Text size="sm" fw={500} c="dimmed">
                      Industries
                    </Text>
                    <Text size="sm">{mentor.industries.join(', ')}</Text>
                  </div>

                  <Group>
                    <div>
                      <Text size="sm" fw={500} c="dimmed">
                        Capacity
                      </Text>
                      <Text size="sm">
                        {mentor.currentMentees}/{mentor.maxMentees} mentees
                      </Text>
                    </div>
                    <div>
                      <Text size="sm" fw={500} c="dimmed">
                        Meeting Frequency
                      </Text>
                      <Text size="sm">{mentor.preferredMeetingFrequency}</Text>
                    </div>
                  </Group>

                  {/* Pricing Information */}
                  <div>
                    <Text size="sm" fw={500} c="dimmed">
                      Mentorship Type
                    </Text>
                    <Group gap="xs">
                      <Badge
                        size="xs"
                        color={
                          mentor.mentorshipType === 'free'
                            ? 'green'
                            : mentor.mentorshipType === 'paid'
                              ? 'blue'
                              : 'orange'
                        }
                      >
                        {mentor.mentorshipType === 'free'
                          ? 'Free'
                          : mentor.mentorshipType === 'paid'
                            ? 'Paid'
                            : 'Free & Paid'}
                      </Badge>
                      {mentor.mentorshipType !== 'free' && (
                        <Text size="sm" c="blue">
                          {mentor.hourlyRate ? `$${mentor.hourlyRate}/hr` : ''}
                          {mentor.sessionRate ? ` $${mentor.sessionRate}/session` : ''}
                          {mentor.monthlyRate ? ` $${mentor.monthlyRate}/month` : ''}
                        </Text>
                      )}
                    </Group>
                  </div>
                </Stack>

                <Progress
                  value={(mentor.currentMentees / mentor.maxMentees) * 100}
                  size="xs"
                  mb="sm"
                  color={
                    mentor.currentMentees >= mentor.maxMentees ? 'red' : 'blue'
                  }
                />

                <Group justify="flex-end">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconEye size={14} />}
                    component={Link}
                    href={`/mentorship/${mentor.alumniId}`}
                  >
                    View Profile
                  </Button>
                </Group>
              </Card>
            );
          })
        ) : (
          <Text ta="center" c="dimmed" py="xl" style={{ gridColumn: '1 / -1' }}>
            No mentors found
          </Text>
        )}
      </SimpleGrid>
    </Stack>
  );
}

// New Request Form Component
function NewRequestForm({ alumni, onSave, onCancel }: any) {
  const [alumniId, setAlumniId] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState('');
  const [currentSituation, setCurrentSituation] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState('');
  const [loading, setLoading] = useState(false);

  const alumniOptions = alumni.map((a: any) => ({
    value: a.id,
    label: `${a.firstName} ${a.lastName} (${a.graduationYear})`,
  }));

  const specializationOptions = [
    'Software Engineering',
    'Data Science',
    'Product Management',
    'Marketing',
    'Business Strategy',
    'Consulting',
    'Finance',
    'Sales',
    'Design',
    'Engineering',
    'Healthcare',
    'Education',
    'Entrepreneurship',
  ];

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Consulting',
    'Education',
    'Manufacturing',
    'Retail',
    'Media',
    'Non-profit',
    'Government',
  ];

  const handleSave = async () => {
    if (!alumniId || specializations.length === 0 || !careerGoals) return;

    try {
      setLoading(true);

      await mockMentorshipService.createMenteeRequest({
        alumniId,
        requestedSpecializations: specializations,
        careerGoals,
        currentSituation,
        preferredMentorIndustries: industries,
        timeCommitment,
      });

      onSave();
    } catch (err) {
      console.error('Failed to create request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Select
        label="Mentee"
        placeholder="Select mentee"
        data={alumniOptions}
        value={alumniId}
        onChange={value => setAlumniId(value || '')}
        searchable
        required
      />

      <Select
        label="Requested Specializations"
        placeholder="Select specializations"
        data={specializationOptions}
        value={specializations[0] || ''}
        onChange={value => setSpecializations(value ? [value] : [])}
        searchable
        required
      />

      <Textarea
        label="Career Goals"
        placeholder="Describe the mentee's career goals..."
        value={careerGoals}
        onChange={e => setCareerGoals(e.target.value)}
        required
        rows={3}
      />

      <Textarea
        label="Current Situation"
        placeholder="Describe the mentee's current situation..."
        value={currentSituation}
        onChange={e => setCurrentSituation(e.target.value)}
        rows={3}
      />

      <Select
        label="Preferred Mentor Industries"
        placeholder="Select preferred industries"
        data={industryOptions}
        value={industries[0] || ''}
        onChange={value => setIndustries(value ? [value] : [])}
        searchable
      />

      <Select
        label="Time Commitment"
        placeholder="Select time commitment"
        data={[
          { value: 'Weekly meetings', label: 'Weekly meetings' },
          { value: 'Bi-weekly meetings', label: 'Bi-weekly meetings' },
          { value: 'Monthly meetings', label: 'Monthly meetings' },
          { value: 'As needed', label: 'As needed' },
        ]}
        value={timeCommitment}
        onChange={value => setTimeCommitment(value || '')}
      />

      <Group justify="flex-end">
        <Button variant="light" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={loading}>
          Create Request
        </Button>
      </Group>
    </Stack>
  );
}
