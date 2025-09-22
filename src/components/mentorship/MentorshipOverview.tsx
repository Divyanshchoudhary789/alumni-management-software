'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Button,
  Progress,
  SimpleGrid,
  ThemeIcon,
  Alert,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import {
  IconUsers,
  IconUserCheck,
  IconUserPlus,
  IconClock,
  IconTrendingUp,
  IconRefresh,
  IconInfoCircle
} from '@tabler/icons-react';
import { mockMentorshipService } from '@/lib/mock-services/mentorshipService';

interface MentorshipOverviewProps {
  stats: any;
  onRefresh: () => void;
}

export function MentorshipOverview({ stats, onRefresh }: MentorshipOverviewProps) {
  const [recentConnections, setRecentConnections] = useState<any[]>([]);
  const [menteeRequests, setMenteeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load recent connections
      const connectionsResponse = await mockMentorshipService.getMentorshipConnections(
        undefined,
        { field: 'createdAt', direction: 'desc' },
        1,
        5
      );
      setRecentConnections(connectionsResponse.data);

      // Load pending mentee requests
      const requestsResponse = await mockMentorshipService.getMenteeRequests('pending');
      setMenteeRequests(requestsResponse.data.slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to load recent data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'pending': return 'orange';
      case 'paused': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!stats) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="No Data" color="blue">
        Loading mentorship program overview...
      </Alert>
    );
  }

  return (
    <Stack gap="lg">
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

      {/* Program Health Metrics */}
      <Card withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Program Health</Title>
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="light"
              size="sm"
              onClick={onRefresh}
              loading={loading}
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <div>
            <Group gap="xs" mb="xs">
              <ThemeIcon size="sm" variant="light" color="blue">
                <IconUsers size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Total Connections</Text>
            </Group>
            <Text size="xl" fw={700}>{stats.totalConnections}</Text>
            <Text size="xs" c="dimmed">All time</Text>
          </div>

          <div>
            <Group gap="xs" mb="xs">
              <ThemeIcon size="sm" variant="light" color="green">
                <IconUserCheck size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Completion Rate</Text>
            </Group>
            <Text size="xl" fw={700}>{stats.successRate}%</Text>
            <Progress value={stats.successRate} size="xs" mt="xs" color="green" />
          </div>

          <div>
            <Group gap="xs" mb="xs">
              <ThemeIcon size="sm" variant="light" color="orange">
                <IconClock size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Avg Duration</Text>
            </Group>
            <Text size="xl" fw={700}>{stats.averageDurationDays}</Text>
            <Text size="xs" c="dimmed">days</Text>
          </div>

          <div>
            <Group gap="xs" mb="xs">
              <ThemeIcon size="sm" variant="light" color="teal">
                <IconTrendingUp size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Active Now</Text>
            </Group>
            <Text size="xl" fw={700}>{stats.activeConnections}</Text>
            <Text size="xs" c="dimmed">ongoing</Text>
          </div>
        </SimpleGrid>
      </Card>

      <Grid>
        {/* Recent Connections */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Recent Connections</Title>
              <Button variant="light" size="xs">
                View All
              </Button>
            </Group>
            
            <Stack gap="sm">
              {recentConnections.length > 0 ? (
                recentConnections.map((connection) => (
                  <Group key={connection.id} justify="space-between" p="sm" style={{
                    border: '1px solid var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-sm)'
                  }}>
                    <div>
                      <Text size="sm" fw={500}>
                        Mentor #{connection.mentorId} → Mentee #{connection.menteeId}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Started {formatDate(connection.startDate)}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(connection.status)} size="sm">
                      {connection.status}
                    </Badge>
                  </Group>
                ))
              ) : (
                <Text c="dimmed" ta="center" py="md">
                  No recent connections
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Pending Mentee Requests */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Pending Requests</Title>
              <Button variant="light" size="xs">
                View All
              </Button>
            </Group>
            
            <Stack gap="sm">
              {menteeRequests.length > 0 ? (
                menteeRequests.map((request) => (
                  <Group key={request.id} justify="space-between" p="sm" style={{
                    border: '1px solid var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-sm)'
                  }}>
                    <div>
                      <Text size="sm" fw={500}>
                        Alumni #{request.alumniId}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {request.requestedSpecializations.join(', ')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Requested {formatDate(request.createdAt)}
                      </Text>
                    </div>
                    <Button size="xs" variant="light">
                      Match
                    </Button>
                  </Group>
                ))
              ) : (
                <Text c="dimmed" ta="center" py="md">
                  No pending requests
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Quick Actions */}
      <Card withBorder>
        <Title order={4} mb="md">Quick Actions</Title>
        <Group>
          <Button leftSection={<IconUserPlus size={16} />} variant="light">
            Create Connection
          </Button>
          <Button leftSection={<IconUsers size={16} />} variant="light">
            Browse Mentors
          </Button>
          <Button leftSection={<IconClock size={16} />} variant="light">
            Review Requests
          </Button>
        </Group>
      </Card>
    </Stack>
  );
}