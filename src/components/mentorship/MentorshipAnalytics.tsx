'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Progress,
  SimpleGrid,
  Select,
  Button,
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconUsers,
  IconClock,
  IconTarget,
  IconChartBar,
  IconDownload,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { mockMentorshipService } from '@/lib/mock-services/mentorshipService';

interface MentorshipAnalyticsProps {
  stats: any;
}

export function MentorshipAnalytics({ stats }: MentorshipAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('6months');
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all connections for analytics
      const response = await mockMentorshipService.getMentorshipConnections(
        undefined,
        { field: 'createdAt', direction: 'desc' },
        1,
        100
      );
      setConnections(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Process data for charts
  const processConnectionsByMonth = () => {
    const monthlyData: {
      [key: string]: { active: number; completed: number; total: number };
    } = {};

    connections.forEach(connection => {
      const month = new Date(connection.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });

      if (!monthlyData[month]) {
        monthlyData[month] = { active: 0, completed: 0, total: 0 };
      }

      monthlyData[month].total++;
      if (connection.status === 'active') {
        monthlyData[month].active++;
      } else if (connection.status === 'completed') {
        monthlyData[month].completed++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6); // Last 6 months
  };

  const processStatusDistribution = () => {
    const statusCounts: { [key: string]: number } = {};

    connections.forEach(connection => {
      statusCounts[connection.status] =
        (statusCounts[connection.status] || 0) + 1;
    });

    const colors = {
      active: '#51cf66',
      completed: '#339af0',
      pending: '#ffd43b',
      paused: '#ff8787',
      cancelled: '#868e96',
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status as keyof typeof colors] || '#868e96',
    }));
  };

  const processDurationAnalysis = () => {
    const completedConnections = connections.filter(
      c => c.status === 'completed'
    );

    const durationRanges = {
      '0-3 months': 0,
      '3-6 months': 0,
      '6-12 months': 0,
      '12+ months': 0,
    };

    completedConnections.forEach(connection => {
      const duration =
        (new Date(connection.endDate).getTime() -
          new Date(connection.startDate).getTime()) /
        (1000 * 60 * 60 * 24);

      if (duration <= 90) {
        durationRanges['0-3 months']++;
      } else if (duration <= 180) {
        durationRanges['3-6 months']++;
      } else if (duration <= 365) {
        durationRanges['6-12 months']++;
      } else {
        durationRanges['12+ months']++;
      }
    });

    return Object.entries(durationRanges).map(([range, count]) => ({
      range,
      count,
    }));
  };

  const monthlyData = processConnectionsByMonth();
  const statusData = processStatusDistribution();
  const durationData = processDurationAnalysis();

  if (!stats) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="No Data" color="blue">
        Loading mentorship analytics...
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

      {/* Controls */}
      <Card withBorder>
        <Group justify="space-between">
          <Title order={4}>Mentorship Analytics</Title>
          <Group>
            <Select
              value={timeRange}
              onChange={value => setTimeRange(value || '6months')}
              data={[
                { value: '3months', label: 'Last 3 months' },
                { value: '6months', label: 'Last 6 months' },
                { value: '1year', label: 'Last year' },
                { value: 'all', label: 'All time' },
              ]}
            />
            <Button leftSection={<IconDownload size={16} />} variant="light">
              Export Report
            </Button>
          </Group>
        </Group>
      </Card>

      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />

        {/* Key Metrics */}
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="lg">
          <Card withBorder>
            <Group gap="xs" mb="xs">
              <IconUsers size={20} color="var(--mantine-color-blue-6)" />
              <Text size="sm" fw={500}>
                Total Connections
              </Text>
            </Group>
            <Text size="xl" fw={700}>
              {stats.totalConnections}
            </Text>
            <Text size="xs" c="dimmed">
              All time
            </Text>
          </Card>

          <Card withBorder>
            <Group gap="xs" mb="xs">
              <IconTarget size={20} color="var(--mantine-color-green-6)" />
              <Text size="sm" fw={500}>
                Success Rate
              </Text>
            </Group>
            <Text size="xl" fw={700}>
              {stats.successRate}%
            </Text>
            <Progress
              value={stats.successRate}
              size="xs"
              mt="xs"
              color="green"
            />
          </Card>

          <Card withBorder>
            <Group gap="xs" mb="xs">
              <IconClock size={20} color="var(--mantine-color-orange-6)" />
              <Text size="sm" fw={500}>
                Avg Duration
              </Text>
            </Group>
            <Text size="xl" fw={700}>
              {stats.averageDurationDays}
            </Text>
            <Text size="xs" c="dimmed">
              days
            </Text>
          </Card>

          <Card withBorder>
            <Group gap="xs" mb="xs">
              <IconTrendingUp size={20} color="var(--mantine-color-teal-6)" />
              <Text size="sm" fw={500}>
                Active Now
              </Text>
            </Group>
            <Text size="xl" fw={700}>
              {stats.activeConnections}
            </Text>
            <Text size="xs" c="dimmed">
              ongoing
            </Text>
          </Card>
        </SimpleGrid>

        <Grid>
          {/* Monthly Connections Trend */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card withBorder>
              <Title order={5} mb="md">
                Monthly Connection Trends
              </Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="active" fill="#51cf66" name="Active" />
                    <Bar dataKey="completed" fill="#339af0" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>

          {/* Status Distribution */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder>
              <Title order={5} mb="md">
                Connection Status
              </Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>

          {/* Duration Analysis */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder>
              <Title order={5} mb="md">
                Mentorship Duration Distribution
              </Title>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={durationData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="range" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#339af0" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>

          {/* Program Health Indicators */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder>
              <Title order={5} mb="md">
                Program Health Indicators
              </Title>
              <Stack gap="md">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Mentor Utilization</Text>
                    <Text size="sm" fw={500}>
                      {stats.totalMentors > 0
                        ? Math.round(
                            ((stats.totalMentors - stats.availableMentors) /
                              stats.totalMentors) *
                              100
                          )
                        : 0}
                      %
                    </Text>
                  </Group>
                  <Progress
                    value={
                      stats.totalMentors > 0
                        ? ((stats.totalMentors - stats.availableMentors) /
                            stats.totalMentors) *
                          100
                        : 0
                    }
                    color="blue"
                  />
                </div>

                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Request Fulfillment</Text>
                    <Text size="sm" fw={500}>
                      {stats.totalMenteeRequests > 0
                        ? Math.round(
                            ((stats.totalMenteeRequests -
                              stats.pendingRequests) /
                              stats.totalMenteeRequests) *
                              100
                          )
                        : 0}
                      %
                    </Text>
                  </Group>
                  <Progress
                    value={
                      stats.totalMenteeRequests > 0
                        ? ((stats.totalMenteeRequests - stats.pendingRequests) /
                            stats.totalMenteeRequests) *
                          100
                        : 0
                    }
                    color="green"
                  />
                </div>

                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm">Program Completion Rate</Text>
                    <Text size="sm" fw={500}>
                      {stats.successRate}%
                    </Text>
                  </Group>
                  <Progress value={stats.successRate} color="teal" />
                </div>

                <Group justify="space-between" mt="md">
                  <div>
                    <Text size="xs" c="dimmed">
                      Available Mentors
                    </Text>
                    <Text fw={500}>{stats.availableMentors}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Pending Requests
                    </Text>
                    <Text fw={500}>{stats.pendingRequests}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Active Connections
                    </Text>
                    <Text fw={500}>{stats.activeConnections}</Text>
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Insights and Recommendations */}
        <Card withBorder>
          <Title order={5} mb="md">
            Insights & Recommendations
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <div>
              <Group gap="xs" mb="xs">
                <IconChartBar size={16} color="var(--mantine-color-blue-6)" />
                <Text size="sm" fw={500}>
                  Program Growth
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {stats.totalConnections > 10
                  ? 'Your mentorship program is showing healthy growth with consistent new connections.'
                  : 'Consider promoting the mentorship program to increase participation.'}
              </Text>
            </div>

            <div>
              <Group gap="xs" mb="xs">
                <IconUsers size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm" fw={500}>
                  Mentor Capacity
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {stats.availableMentors > 5
                  ? 'Good mentor availability. Focus on matching quality over quantity.'
                  : 'Consider recruiting more mentors to meet demand.'}
              </Text>
            </div>

            <div>
              <Group gap="xs" mb="xs">
                <IconTarget size={16} color="var(--mantine-color-orange-6)" />
                <Text size="sm" fw={500}>
                  Success Rate
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                {stats.successRate > 70
                  ? 'Excellent success rate! Your matching process is working well.'
                  : 'Consider improving the matching algorithm or providing more support.'}
              </Text>
            </div>
          </SimpleGrid>
        </Card>
      </div>
    </Stack>
  );
}
