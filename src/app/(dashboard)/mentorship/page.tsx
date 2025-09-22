'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Tabs,
  Grid,
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
  Alert
} from '@mantine/core';
import {
  IconUsers,
  IconUserPlus,
  IconChartBar,
  IconSettings,
  IconRefresh,
  IconInfoCircle
} from '@tabler/icons-react';
import { mockMentorshipService } from '@/lib/mock-services/mentorshipService';
import { MentorshipOverview } from '@/components/mentorship/MentorshipOverview';
import { MentorshipConnections } from '@/components/mentorship/MentorshipConnections';
import { MentorMatching } from '@/components/mentorship/MentorMatching';
import { MentorshipAnalytics } from '@/components/mentorship/MentorshipAnalytics';

export default function MentorshipPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockMentorshipService.getMentorshipStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load mentorship statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    loadStats();
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1} size="h2" mb="xs">
            Mentorship Program
          </Title>
          <Text c="dimmed" size="sm">
            Connect alumni mentors with mentees to foster career growth and networking
          </Text>
        </div>
        <Group>
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={handleRefresh}
              loading={loading}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {error && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {/* Quick Stats Cards */}
      {stats && (
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Active Connections
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.activeConnections}
                  </Text>
                </div>
                <IconUsers size={24} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Available Mentors
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.availableMentors}
                  </Text>
                </div>
                <IconUserPlus size={24} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Pending Requests
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.pendingRequests}
                  </Text>
                </div>
                <IconChartBar size={24} color="var(--mantine-color-orange-6)" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Success Rate
                  </Text>
                  <Text fw={700} size="xl">
                    {stats.successRate}%
                  </Text>
                </div>
                <Badge color="teal" variant="light" size="sm">
                  Success
                </Badge>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="connections" leftSection={<IconUsers size={16} />}>
            Connections
          </Tabs.Tab>
          <Tabs.Tab value="matching" leftSection={<IconUserPlus size={16} />}>
            Matching
          </Tabs.Tab>
          <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          
          <Tabs.Panel value="overview" pt="md">
            <MentorshipOverview stats={stats} onRefresh={handleRefresh} />
          </Tabs.Panel>

          <Tabs.Panel value="connections" pt="md">
            <MentorshipConnections />
          </Tabs.Panel>

          <Tabs.Panel value="matching" pt="md">
            <MentorMatching />
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="md">
            <MentorshipAnalytics stats={stats} />
          </Tabs.Panel>
        </div>
      </Tabs>
    </Container>
  );
}