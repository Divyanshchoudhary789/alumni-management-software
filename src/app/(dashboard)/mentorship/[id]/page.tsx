'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Stack,
  Group,
  Button,
  Card,
  Text,
  Title,
  Badge,
  Grid,
  Avatar,
  Progress,
  Alert,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
  Divider,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconStar,
  IconUsers,
  IconBriefcase,
  IconMapPin,
  IconMail,
  IconPhone,
  IconCalendar,
  IconCheck,
  IconInfoCircle,
  IconCreditCard,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { mockMentorshipService } from '@/lib/mock-services/mentorshipService';
import { alumniProfileService } from '@/services/alumniProfileService';

export default function MentorDetailPage() {
  const params = useParams();
  const mentorId = params.id as string;

  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch mentor profiles
  const {
    data: mentorsData,
    loading: mentorLoading,
    error: mentorError,
  } = useApi(() => mockMentorshipService.getMentorProfiles(), {
    showErrorNotification: false,
    immediate: true,
  });

  const mentor = mentorsData?.data?.find(m => m.alumniId === mentorId);

  // Load alumni data for name resolution
  useEffect(() => {
    const loadAlumni = async () => {
      try {
        const response = await alumniProfileService.getAlumni();
        setAlumni(response.data);
      } catch (err) {
        console.error('Failed to load alumni data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlumni();
  }, []);

  const getAlumniDetails = (alumniId: string) => {
    return alumni.find(a => a.id === alumniId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMentorshipTypeColor = (type: string) => {
    switch (type) {
      case 'free':
        return 'green';
      case 'paid':
        return 'blue';
      case 'both':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getMentorshipTypeLabel = (type: string) => {
    switch (type) {
      case 'free':
        return 'Free Mentorship';
      case 'paid':
        return 'Paid Mentorship';
      case 'both':
        return 'Free & Paid Options';
      default:
        return 'Unknown';
    }
  };

  if (mentorLoading || loading) {
    return (
      <Stack gap="md">
        <Group>
          <Button variant="light" leftSection={<IconArrowLeft size={16} />}>
            Back to Mentors
          </Button>
        </Group>
        <Card withBorder radius="md" p="lg">
          <LoadingOverlay visible />
          <Stack gap="md">
            <Group>
              <Avatar size="xl" />
              <div>
                <Title order={3}>Loading...</Title>
                <Text c="dimmed">Loading mentor profile...</Text>
              </div>
            </Group>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (mentorError || !mentor) {
    return (
      <Stack gap="md">
        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            component={Link}
            href="/mentorship"
          >
            Back to Mentors
          </Button>
        </Group>
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
        >
          {mentorError || 'Mentor not found'}
        </Alert>
      </Stack>
    );
  }

  const alumniDetails = getAlumniDetails(mentor.alumniId);

  return (
    <Stack gap="md">
      <Group>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          component={Link}
          href="/mentorship"
        >
          Back to Mentors
        </Button>
      </Group>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between">
            <Group>
              <Avatar size="xl" src={alumniDetails?.profileImage} />
              <div>
                <Title order={2}>
                  {alumniDetails?.firstName} {alumniDetails?.lastName}
                </Title>
                <Text c="dimmed" size="lg">
                  {alumniDetails?.currentPosition} at {alumniDetails?.currentCompany}
                </Text>
                <Group gap="xs" mt="xs">
                  <Badge color={getMentorshipTypeColor(mentor.mentorshipType)} size="sm">
                    {getMentorshipTypeLabel(mentor.mentorshipType)}
                  </Badge>
                  <Badge
                    color={mentor.isActive ? 'green' : 'red'}
                    size="sm"
                    variant="light"
                  >
                    {mentor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Group>
              </div>
            </Group>

            <div style={{ textAlign: 'right' }}>
              <Text size="sm" c="dimmed">
                Experience
              </Text>
              <Text fw={500} size="lg">
                {mentor.yearsOfExperience} years
              </Text>
            </div>
          </Group>

          <Divider />

          {/* Bio */}
          <div>
            <Title order={4} mb="sm">
              About
            </Title>
            <Text>{mentor.bio}</Text>
          </div>

          {/* Pricing Information */}
          {mentor.mentorshipType !== 'free' && (
            <>
              <Divider />
              <div>
                <Title order={4} mb="sm">
                  Pricing
                </Title>
                <Grid>
                  {mentor.hourlyRate && (
                    <Grid.Col span={4}>
                      <Card withBorder p="sm">
                        <Text size="sm" c="dimmed">
                          Hourly Rate
                        </Text>
                        <Text fw={500} size="lg">
                          ${mentor.hourlyRate}
                        </Text>
                      </Card>
                    </Grid.Col>
                  )}
                  {mentor.sessionRate && (
                    <Grid.Col span={4}>
                      <Card withBorder p="sm">
                        <Text size="sm" c="dimmed">
                          Per Session
                        </Text>
                        <Text fw={500} size="lg">
                          ${mentor.sessionRate}
                        </Text>
                      </Card>
                    </Grid.Col>
                  )}
                  {mentor.monthlyRate && (
                    <Grid.Col span={4}>
                      <Card withBorder p="sm">
                        <Text size="sm" c="dimmed">
                          Monthly
                        </Text>
                        <Text fw={500} size="lg">
                          ${mentor.monthlyRate}
                        </Text>
                      </Card>
                    </Grid.Col>
                  )}
                </Grid>
                {mentor.paymentMethods && mentor.paymentMethods.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <Text size="sm" c="dimmed" mb="xs">
                      Accepted Payment Methods
                    </Text>
                    <Group gap="xs">
                      {mentor.paymentMethods.map((method: string) => (
                        <Badge key={method} size="sm" variant="light">
                          {method === 'stripe' ? 'Stripe' :
                           method === 'paypal' ? 'PayPal' : method}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                )}
              </div>
            </>
          )}

          <Divider />

          {/* Specializations */}
          <div>
            <Title order={4} mb="sm">
              Specializations
            </Title>
            <Group gap="xs">
              {mentor.specializations.map((spec: string) => (
                <Badge key={spec} variant="light">
                  {spec}
                </Badge>
              ))}
            </Group>
          </div>

          {/* Industries */}
          <div>
            <Title order={4} mb="sm">
              Industries
            </Title>
            <Text>{mentor.industries.join(', ')}</Text>
          </div>

          {/* Capacity */}
          <div>
            <Title order={4} mb="sm">
              Capacity & Availability
            </Title>
            <Grid>
              <Grid.Col span={6}>
                <Card withBorder p="sm">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Current Mentees
                      </Text>
                      <Text fw={500}>
                        {mentor.currentMentees}/{mentor.maxMentees}
                      </Text>
                    </div>
                    <IconUsers size={20} />
                  </Group>
                  <Progress
                    value={(mentor.currentMentees / mentor.maxMentees) * 100}
                    size="sm"
                    mt="xs"
                    color={mentor.currentMentees >= mentor.maxMentees ? 'red' : 'blue'}
                  />
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card withBorder p="sm">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Meeting Frequency
                      </Text>
                      <Text fw={500}>
                        {mentor.preferredMeetingFrequency}
                      </Text>
                    </div>
                    <IconCalendar size={20} />
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </div>

          {/* Contact Information */}
          {alumniDetails && (
            <>
              <Divider />
              <div>
                <Title order={4} mb="sm">
                  Contact Information
                </Title>
                <Stack gap="xs">
                  {alumniDetails.email && (
                    <Group gap="xs">
                      <IconMail size={16} />
                      <Text>{alumniDetails.email}</Text>
                    </Group>
                  )}
                  {alumniDetails.phone && (
                    <Group gap="xs">
                      <IconPhone size={16} />
                      <Text>{alumniDetails.phone}</Text>
                    </Group>
                  )}
                  {alumniDetails.location && (
                    <Group gap="xs">
                      <IconMapPin size={16} />
                      <Text>{alumniDetails.location}</Text>
                    </Group>
                  )}
                </Stack>
              </div>
            </>
          )}

          {/* Actions */}
          <Divider />
          <Group justify="flex-end">
            {mentor.mentorshipType === 'free' || mentor.mentorshipType === 'both' ? (
              <Button
                variant="light"
                leftSection={<IconCheck size={16} />}
                disabled={!mentor.isActive || mentor.currentMentees >= mentor.maxMentees}
              >
                Request Free Mentorship
              </Button>
            ) : null}
            {mentor.mentorshipType === 'paid' || mentor.mentorshipType === 'both' ? (
              <Button
                leftSection={<IconCreditCard size={16} />}
                disabled={!mentor.isActive || mentor.currentMentees >= mentor.maxMentees}
                component={Link}
                href={`/mentorship/${mentorId}/payment`}
              >
                Start Paid Mentorship
              </Button>
            ) : null}
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}