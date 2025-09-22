import { SimpleGrid, Skeleton } from '@mantine/core';
import { IconUsers, IconCalendarEvent, IconCurrencyDollar, IconUserCheck } from '@tabler/icons-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { DashboardMetrics } from '@/types';

interface MetricsGridProps {
  metrics: DashboardMetrics | null;
  loading?: boolean;
}

export function MetricsGrid({ metrics, loading = false }: MetricsGridProps) {
  if (loading || !metrics) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={120} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <StatsCard
        title="Total Alumni"
        value={formatNumber(metrics.totalAlumni)}
        trend={metrics.trends.alumniGrowth}
        description="Registered alumni members"
        icon={<IconUsers size={20} />}
        color="blue"
      />
      
      <StatsCard
        title="Active Members"
        value={formatNumber(metrics.activeMembers)}
        trend={metrics.trends.memberActivity}
        description="Active in last 6 months"
        icon={<IconUserCheck size={20} />}
        color="green"
        showProgress
        progressValue={(metrics.activeMembers / metrics.totalAlumni) * 100}
        progressColor="green"
      />
      
      <StatsCard
        title="Upcoming Events"
        value={metrics.upcomingEvents}
        trend={metrics.trends.eventAttendance}
        description="Published events"
        icon={<IconCalendarEvent size={20} />}
        color="orange"
      />
      
      <StatsCard
        title="Monthly Donations"
        value={formatCurrency(metrics.monthlyDonations)}
        trend={metrics.trends.donationGrowth}
        description="This month's contributions"
        icon={<IconCurrencyDollar size={20} />}
        color="teal"
      />
    </SimpleGrid>
  );
}