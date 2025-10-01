'use client';

import {
  Card,
  Title,
  Group,
  Text,
  SimpleGrid,
  Skeleton,
  Badge,
  Progress,
} from '@mantine/core';
import {
  IconUsers,
  IconTrendingUp,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconMail,
  IconEye,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import {
  mockAnalyticsService,
  EngagementMetrics,
} from '@/lib/mock-services/analyticsService';

interface AnalyticsOverviewProps {
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function AnalyticsOverview({ dateRange }: AnalyticsOverviewProps) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const response = await mockAnalyticsService.getEngagementMetrics({
          dateRange,
        });
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to load engagement metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [dateRange]);

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} withBorder radius="md" p="lg">
            <Group justify="space-between" mb="xs">
              <Skeleton height={20} width="60%" />
              <Skeleton height={24} width={24} />
            </Group>
            <Skeleton height={32} width="40%" mb="xs" />
            <Skeleton height={16} width="80%" />
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  if (!metrics) {
    return (
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed" ta="center">
          Failed to load analytics data
        </Text>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;
  const formatDuration = (minutes: number) => `${minutes.toFixed(1)}m`;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {/* Total Users */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>
            Total Users
          </Text>
          <IconUsers size={20} color="var(--mantine-color-blue-6)" />
        </Group>
        <Text size="xl" fw={700} mb="xs">
          {formatNumber(metrics.totalUsers)}
        </Text>
        <Group gap="xs">
          <Badge size="sm" variant="light" color="blue">
            {formatNumber(metrics.activeUsers)} active
          </Badge>
        </Group>
      </Card>

      {/* Engagement Rate */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>
            Engagement Rate
          </Text>
          <IconTrendingUp size={20} color="var(--mantine-color-green-6)" />
        </Group>
        <Text size="xl" fw={700} mb="xs">
          {formatPercentage(metrics.engagementRate)}
        </Text>
        <Progress
          value={metrics.engagementRate}
          size="sm"
          color={
            metrics.engagementRate > 70
              ? 'green'
              : metrics.engagementRate > 50
                ? 'yellow'
                : 'red'
          }
        />
      </Card>

      {/* Page Views */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>
            Page Views
          </Text>
          <IconEye size={20} color="var(--mantine-color-violet-6)" />
        </Group>
        <Text size="xl" fw={700} mb="xs">
          {formatNumber(metrics.pageViews)}
        </Text>
        <Text size="sm" c="dimmed">
          {formatNumber(metrics.uniqueVisitors)} unique visitors
        </Text>
      </Card>

      {/* Average Session Duration */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>
            Avg. Session Duration
          </Text>
          <IconCalendarEvent size={20} color="var(--mantine-color-orange-6)" />
        </Group>
        <Text size="xl" fw={700} mb="xs">
          {formatDuration(metrics.averageSessionDuration)}
        </Text>
        <Text size="sm" c="dimmed">
          {formatPercentage(100 - metrics.bounceRate)} engagement
        </Text>
      </Card>

      {/* Return Visitor Rate */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>
            Return Visitors
          </Text>
          <IconUsers size={20} color="var(--mantine-color-teal-6)" />
        </Group>
        <Text size="xl" fw={700} mb="xs">
          {formatPercentage(metrics.returnVisitorRate)}
        </Text>
        <Progress
          value={metrics.returnVisitorRate}
          size="sm"
          color={metrics.returnVisitorRate > 60 ? 'teal' : 'orange'}
        />
      </Card>

      {/* Bounce Rate */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>
            Bounce Rate
          </Text>
          <IconTrendingUp
            size={20}
            color={
              metrics.bounceRate < 30
                ? 'var(--mantine-color-green-6)'
                : 'var(--mantine-color-red-6)'
            }
          />
        </Group>
        <Text size="xl" fw={700} mb="xs">
          {formatPercentage(metrics.bounceRate)}
        </Text>
        <Progress
          value={metrics.bounceRate}
          size="sm"
          color={
            metrics.bounceRate < 30
              ? 'green'
              : metrics.bounceRate < 50
                ? 'yellow'
                : 'red'
          }
        />
      </Card>
    </SimpleGrid>
  );
}
