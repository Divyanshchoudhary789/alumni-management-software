import { Card, Title, Group, Select, Skeleton, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useState, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { mockAlumniService } from '@/lib/mock-services/alumniService';

interface AlumniGrowthChartProps {
  height?: number;
}

export function AlumniGrowthChart({ height = 300 }: AlumniGrowthChartProps) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Fetch alumni statistics for the chart
  const apiCall = useCallback(() => mockAlumniService.getAlumniStats().then(res => res.data), []);

  const {
    data: alumniStats,
    loading,
    error,
  } = useApi(apiCall, {
    showErrorNotification: false,
    immediate: true,
  });

  // Transform alumni graduation year stats to chart format
  const chartData =
    alumniStats?.graduationYearDistribution
      ? Object.entries(alumniStats.graduationYearDistribution).map(([year, count]) => ({
          period: year,
          count,
        }))
      : [];

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Alumni Growth</Title>
          <Skeleton height={36} width={120} />
        </Group>
        <Skeleton height={height} />
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Alumni Growth</Title>
          <Select
            value={period}
            onChange={value => setPeriod(value as 'month' | 'quarter' | 'year')}
            data={[
              { value: 'month', label: 'Monthly' },
              { value: 'quarter', label: 'Quarterly' },
              { value: 'year', label: 'Yearly' },
            ]}
            size="sm"
            w={120}
          />
        </Group>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No data available</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <Title order={3}>Alumni Growth</Title>
        <Select
          value={period}
          onChange={value => setPeriod(value as 'month' | 'quarter' | 'year')}
          data={[
            { value: 'month', label: 'Monthly' },
            { value: 'quarter', label: 'Quarterly' },
            { value: 'year', label: 'Yearly' },
          ]}
          size="sm"
          w={120}
        />
      </Group>

      <LineChart
        h={height}
        data={chartData}
        dataKey="period"
        series={[{ name: 'count', label: 'Alumni Count', color: 'blue.6' }]}
        curveType="monotone"
        strokeWidth={3}
        dotProps={{ r: 4, strokeWidth: 2 }}
        activeDotProps={{ r: 6, strokeWidth: 2 }}
        gridAxis="xy"
        tickLine="xy"
        xAxisLabel="Period"
        yAxisLabel="Number of Alumni"
        withTooltip
        tooltipAnimationDuration={200}
        valueFormatter={value => value.toLocaleString()}
      />
    </Card>
  );
}
