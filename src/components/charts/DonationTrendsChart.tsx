import {
  Card,
  Title,
  Group,
  SegmentedControl,
  Skeleton,
  Text,
} from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { mockDashboardService } from '@/lib/mock-services/dashboardService';

interface DonationTrendsChartProps {
  height?: number;
}

export function DonationTrendsChart({
  height = 300,
}: DonationTrendsChartProps) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [viewType, setViewType] = useState<'amount' | 'count'>('amount');

  // Fetch donation trends data for the chart
  const apiCall = useCallback(() => mockDashboardService.getDonationTrends(period).then(res => res.data), [period]);

  const {
    data: donationTrendsData,
    loading,
    error,
  } = useApi(apiCall, {
    showErrorNotification: false,
    immediate: true,
  });

  // Transform data for chart (using donation trends data)
  const chartData = donationTrendsData?.map(
    (stat: any) => ({
      period: stat.period,
      amount: stat.amount || 0,
      count: stat.count || 0,
    })
  ) || [
    // Fallback data if no stats available
    { period: 'Jan', amount: 0, count: 0 },
    { period: 'Feb', amount: 0, count: 0 },
    { period: 'Mar', amount: 0, count: 0 },
  ];

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Donation Trends</Title>
          <Skeleton height={36} width={200} />
        </Group>
        <Skeleton height={height} />
      </Card>
    );
  }

  const formatValue = (value: number) => {
    if (viewType === 'amount') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3}>Donation Trends</Title>
            <Text size="sm" c="dimmed">
              No data available
            </Text>
          </div>
          <Group gap="xs">
            <SegmentedControl
              value={viewType}
              onChange={value => setViewType(value as 'amount' | 'count')}
              data={[
                { label: 'Amount', value: 'amount' },
                { label: 'Count', value: 'count' },
              ]}
              size="sm"
            />
          </Group>
        </Group>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No data available</Text>
        </div>
      </Card>
    );
  }

  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={3}>Donation Trends</Title>
          <Text size="sm" c="dimmed">
            {viewType === 'amount'
              ? `Total: ${formatValue(totalAmount)}`
              : `Total: ${totalCount} donations`}
          </Text>
        </div>
        <Group gap="xs">
          <SegmentedControl
            value={viewType}
            onChange={value => setViewType(value as 'amount' | 'count')}
            data={[
              { label: 'Amount', value: 'amount' },
              { label: 'Count', value: 'count' },
            ]}
            size="sm"
          />
        </Group>
      </Group>

      <AreaChart
        h={height}
        data={chartData}
        dataKey="period"
        series={[
          {
            name: viewType,
            label:
              viewType === 'amount' ? 'Donation Amount' : 'Number of Donations',
            color: 'teal.6',
          },
        ]}
        curveType="monotone"
        strokeWidth={2}
        fillOpacity={0.3}
        gridAxis="xy"
        tickLine="xy"
        xAxisLabel="Period"
        yAxisLabel={
          viewType === 'amount' ? 'Amount ($)' : 'Number of Donations'
        }
        withTooltip
        tooltipAnimationDuration={200}
        valueFormatter={formatValue}
        withDots={false}
      />
    </Card>
  );
}
