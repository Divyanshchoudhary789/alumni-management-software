'use client';

import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  SimpleGrid,
} from '@mantine/core';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { ChartsGrid } from '@/components/dashboard/ChartsGrid';
import { RecentActivitiesFeed } from '@/components/dashboard/RecentActivitiesFeed';
import { useApi } from '@/hooks/useApi';
import { useCallback } from 'react';
import { mockDashboardService } from '@/lib/mock-services/dashboardService';
import { DashboardMetrics } from '@/services/api';

export default function DashboardPage() {
  // Fetch dashboard metrics from mock API
  const apiCall = useCallback(() => mockDashboardService.getDashboardMetrics().then(res => res.data), []);

  const {
    data: metrics,
    loading,
    error,
  } = useApi(apiCall, {
    showErrorNotification: true,
    immediate: true,
  });

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Dashboard</Title>
            <Text c="dimmed">Welcome to your Alumni Management Dashboard</Text>
          </div>
        </Group>

        <MetricsGrid metrics={metrics} loading={loading} />

        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
          <div style={{ gridColumn: 'span 2' }}>
            <ChartsGrid loading={loading} />
          </div>
          <RecentActivitiesFeed height={800} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
