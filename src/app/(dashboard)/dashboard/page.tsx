'use client';

import { Container, Title, Text, Stack, Group, SimpleGrid } from '@mantine/core';
import { useEffect, useState } from 'react';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { ChartsGrid } from '@/components/dashboard/ChartsGrid';
import { RecentActivitiesFeed } from '@/components/dashboard/RecentActivitiesFeed';
import { alumniApiService, eventsApiService, checkBackendHealth } from '@/services/api';
import { DashboardMetrics } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        
        // Check if backend is available
        const isBackendHealthy = await checkBackendHealth();
        if (!isBackendHealthy) {
          throw new Error('Backend server is not available');
        }

        // Fetch real data from APIs
        const [alumniStats, eventsStats] = await Promise.all([
          alumniApiService.getAlumniStats(),
          eventsApiService.getEventsStats(),
        ]);

        // Transform API data to dashboard metrics format
        const dashboardMetrics: DashboardMetrics = {
          totalAlumni: alumniStats.totalAlumni,
          totalEvents: eventsStats.totalEvents,
          totalDonations: 0, // Will be added when donations API is ready
          activeMembers: alumniStats.publicProfiles,
          alumniGrowth: alumniStats.recentAlumni,
          eventAttendance: eventsStats.averageAttendance,
          donationGrowth: 0, // Will be added when donations API is ready
          membershipGrowth: ((alumniStats.recentAlumni / alumniStats.totalAlumni) * 100),
          recentActivities: [], // Will be populated from activities API
          chartData: {
            alumniGrowth: alumniStats.graduationYearStats.map(stat => ({
              month: stat._id.toString(),
              value: stat.count,
            })),
            eventAttendance: eventsStats.monthlyEvents || [],
            donationTrends: [], // Will be added when donations API is ready
          },
        };

        setMetrics(dashboardMetrics);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
        // Fallback to mock data if API fails
        try {
          const { mockDashboardService } = await import('@/lib/mock-services');
          const response = await mockDashboardService.getDashboardMetrics();
          setMetrics(response.data);
        } catch (mockError) {
          console.error('Mock data also failed:', mockError);
        }
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