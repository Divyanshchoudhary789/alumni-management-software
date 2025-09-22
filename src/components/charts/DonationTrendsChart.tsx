import { Card, Title, Group, SegmentedControl, Skeleton, Text } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { useState, useEffect } from 'react';
import { mockDashboardService } from '@/lib/mock-services';

interface DonationTrendsChartProps {
  height?: number;
}

export function DonationTrendsChart({ height = 300 }: DonationTrendsChartProps) {
  const [data, setData] = useState<Array<{ period: string; amount: number; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [viewType, setViewType] = useState<'amount' | 'count'>('amount');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await mockDashboardService.getDonationTrends(period);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load donation trends data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

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

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={3}>Donation Trends</Title>
          <Text size="sm" c="dimmed">
            {viewType === 'amount' 
              ? `Total: ${formatValue(totalAmount)}`
              : `Total: ${totalCount} donations`
            }
          </Text>
        </div>
        <Group gap="xs">
          <SegmentedControl
            value={viewType}
            onChange={(value) => setViewType(value as 'amount' | 'count')}
            data={[
              { label: 'Amount', value: 'amount' },
              { label: 'Count', value: 'count' }
            ]}
            size="sm"
          />
        </Group>
      </Group>
      
      <AreaChart
        h={height}
        data={data}
        dataKey="period"
        series={[
          { 
            name: viewType, 
            label: viewType === 'amount' ? 'Donation Amount' : 'Number of Donations', 
            color: 'teal.6' 
          }
        ]}
        curveType="monotone"
        strokeWidth={2}
        fillOpacity={0.3}
        gridAxis="xy"
        tickLine="xy"
        xAxisLabel="Period"
        yAxisLabel={viewType === 'amount' ? 'Amount ($)' : 'Number of Donations'}
        withTooltip
        tooltipAnimationDuration={200}
        valueFormatter={formatValue}
        withDots={false}
      />
    </Card>
  );
}