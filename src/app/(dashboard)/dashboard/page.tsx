'use client';

import { Container, Title, Text, Stack, Group, SimpleGrid } from '@mantine/core';
import { useEffect, useState } from 'react';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { ChartsGrid } from '@/components/dashboard/ChartsGrid';
import { RecentActivitiesFeed } from '@/components/dashboard/RecentActivitiesFeed';
import { mockDashboardService } from '@/lib/mock-services';
import { DashboardMetrics } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const response = await mockDashboardService.getDashboardMetrics();
        const data = response.data;
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Dashboard</Title>
            <Text c="dimmed">
              Welcome to your Alumni Management Dashboard
            </Text>
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