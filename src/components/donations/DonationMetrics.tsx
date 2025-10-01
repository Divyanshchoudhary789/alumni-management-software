'use client';

import { Grid, Card, Text, Group, ThemeIcon, Skeleton } from '@mantine/core';
import {
  IconCurrencyDollar,
  IconTrendingUp,
  IconUsers,
  IconGift,
} from '@tabler/icons-react';
import { StatsCard } from '@/components/ui/StatsCard';

interface DonationMetricsProps {
  stats: any;
  loading: boolean;
}

export function DonationMetrics({ stats, loading }: DonationMetricsProps) {
  if (loading) {
    return (
      <Grid>
        {[...Array(4)].map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
            <Card padding="lg" radius="md" withBorder>
              <Skeleton height={60} />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  if (!stats) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate trends (mock calculation for demo)
  const totalAmountTrend = 12.5; // Mock percentage increase
  const donationCountTrend = 8.3;
  const averageTrend = 3.7;
  const completionRate =
    (stats.completedDonations / stats.totalDonations) * 100;

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <StatsCard
          title="Total Raised"
          value={formatCurrency(stats.totalAmount)}
          trend={totalAmountTrend}
          icon={<IconCurrencyDollar size={24} />}
          color="green"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <StatsCard
          title="Total Donations"
          value={stats.completedDonations.toLocaleString()}
          trend={donationCountTrend}
          icon={<IconGift size={24} />}
          color="blue"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <StatsCard
          title="Average Donation"
          value={formatCurrency(stats.averageDonation)}
          trend={averageTrend}
          icon={<IconTrendingUp size={24} />}
          color="violet"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
        <StatsCard
          title="Success Rate"
          value={`${completionRate.toFixed(1)}%`}
          trend={2.1}
          icon={<IconUsers size={24} />}
          color="teal"
        />
      </Grid.Col>
    </Grid>
  );
}
