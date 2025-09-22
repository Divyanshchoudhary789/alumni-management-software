'use client';

import { Card, Title, Group, Text, SimpleGrid, Skeleton, Badge, Progress } from '@mantine/core';
import { BarChart, LineChart, AreaChart, PieChart } from '@mantine/charts';
import { IconCurrencyDollar, IconUsers, IconTrendingUp, IconGift } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { mockAnalyticsService, DonationAnalytics, AnalyticsFilters } from '@/lib/mock-services/analyticsService';

interface DonationAnalyticsChartsProps {
  filters?: AnalyticsFilters;
}

export function DonationAnalyticsCharts({ filters }: DonationAnalyticsChartsProps) {
  const [data, setData] = useState<DonationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await mockAnalyticsService.getDonationAnalytics(filters);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load donation analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} withBorder radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Skeleton height={24} width="60%" />
              <Skeleton height={24} width={24} />
            </Group>
            <Skeleton height={300} />
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  if (!data) {
    return (
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed" ta="center">Failed to load donation analytics data</Text>
      </Card>
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

  const topPurposesData = data.topDonationPurposes.map(item => ({
    purpose: item.purpose.length > 15 ? item.purpose.substring(0, 15) + '...' : item.purpose,
    amount: item.amount,
    count: item.count,
    Amount: item.amount,
    Count: item.count
  }));

  const monthlyTrendData = data.monthlyTrends.map(item => ({
    month: item.month,
    amount: item.amount,
    count: item.count,
    Amount: item.amount,
    Count: item.count
  }));

  const donorSegmentData = data.donorSegments.map(item => ({
    name: item.segment,
    value: item.totalAmount,
    count: item.count,
    color: item.segment.includes('Major') ? 'var(--mantine-color-green-6)' :
           item.segment.includes('Regular') ? 'var(--mantine-color-blue-6)' :
           'var(--mantine-color-orange-6)'
  }));

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      {/* Donation Overview Stats */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>Total Donations</Text>
          <IconCurrencyDollar size={20} color="var(--mantine-color-green-6)" />
        </Group>
        <Text size="xl" fw={700} mb="md">{formatCurrency(data.totalAmount)}</Text>
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Number of Donations</Text>
          <Text size="sm" fw={500}>{data.totalDonations.toLocaleString()}</Text>
        </Group>
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Average Donation</Text>
          <Text size="sm" fw={500}>{formatCurrency(data.averageDonation)}</Text>
        </Group>
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Donor Retention Rate</Text>
          <Badge size="sm" variant="light" color={data.donorRetentionRate > 50 ? 'green' : 'orange'}>
            {data.donorRetentionRate.toFixed(1)}%
          </Badge>
        </Group>
        
        <Progress 
          value={data.donorRetentionRate} 
          size="sm" 
          color={data.donorRetentionRate > 50 ? 'green' : data.donorRetentionRate > 30 ? 'yellow' : 'red'}
          mt="md"
        />
      </Card>

      {/* Donor Segments */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Donor Segments</Title>
        <PieChart
          h={300}
          data={donorSegmentData}
          withTooltip
          tooltipDataSource="segment"
          mx="auto"
          withLabelsLine
          withLabels
          valueFormatter={(value) => formatCurrency(value)}
        />
      </Card>

      {/* Top Donation Purposes */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Top Donation Purposes</Title>
        <BarChart
          h={300}
          data={topPurposesData}
          dataKey="purpose"
          series={[{ name: 'Amount', color: 'green.6' }]}
          tickLine="y"
          gridAxis="y"
          withTooltip
          tooltipAnimationDuration={200}
          valueFormatter={(value) => formatCurrency(value)}
        />
      </Card>

      {/* Monthly Donation Trends */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Monthly Donation Trends</Title>
        <LineChart
          h={300}
          data={monthlyTrendData}
          dataKey="month"
          series={[
            { name: 'Amount', color: 'green.6' }
          ]}
          curveType="monotone"
          strokeWidth={3}
          dotProps={{ r: 4, strokeWidth: 2 }}
          activeDotProps={{ r: 6, strokeWidth: 2 }}
          gridAxis="xy"
          tickLine="xy"
          withTooltip
          tooltipAnimationDuration={200}
          valueFormatter={(value) => formatCurrency(value)}
        />
      </Card>

      {/* Donation Count Trends */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Donation Count Trends</Title>
        <AreaChart
          h={300}
          data={monthlyTrendData}
          dataKey="month"
          series={[
            { name: 'Count', color: 'blue.6' }
          ]}
          curveType="monotone"
          strokeWidth={2}
          fillOpacity={0.3}
          gridAxis="xy"
          tickLine="xy"
          withTooltip
          tooltipAnimationDuration={200}
          withDots={false}
        />
      </Card>

      {/* Combined Trends */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Combined Donation Trends</Title>
        <LineChart
          h={300}
          data={monthlyTrendData}
          dataKey="month"
          series={[
            { name: 'Amount', color: 'green.6', yAxisId: 'left' },
            { name: 'Count', color: 'blue.6', yAxisId: 'right' }
          ]}
          curveType="monotone"
          strokeWidth={3}
          dotProps={{ r: 4, strokeWidth: 2 }}
          activeDotProps={{ r: 6, strokeWidth: 2 }}
          gridAxis="xy"
          tickLine="xy"
          withTooltip
          tooltipAnimationDuration={200}
        />
      </Card>
    </SimpleGrid>
  );
}