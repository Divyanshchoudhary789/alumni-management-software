import { Card, Title, Skeleton, Text } from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { mockAlumniService } from '@/lib/mock-services/alumniService';

interface MemberActivityChartProps {
  height?: number;
}

export function MemberActivityChart({
  height = 300,
}: MemberActivityChartProps) {
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

  // Transform data for pie chart
  const chartData = alumniStats
    ? [
        {
          name: 'Public Profiles',
          value: alumniStats.publicProfiles,
          color: 'blue.6',
        },
        {
          name: 'Private Profiles',
          value: alumniStats.totalAlumni - alumniStats.publicProfiles,
          color: 'gray.6',
        },
        {
          name: 'Recent Alumni',
          value: Math.floor(alumniStats.totalAlumni * 0.1), // Assume 10% are recent
          color: 'green.6',
        },
      ]
    : [];

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Title order={3} mb="md">
          Member Activity
        </Title>
        <Skeleton height={height} />
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card withBorder radius="md" p="lg">
        <Title order={3} mb="md">
          Member Activity
        </Title>
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No data available</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={3} mb="md">
        Member Activity
      </Title>

      <PieChart
        h={height}
        data={chartData}
        withLabelsLine
        labelsPosition="outside"
        labelsType="percent"
        withTooltip
        tooltipDataSource="segment"
        mx="auto"
        strokeWidth={1}
        valueFormatter={value => value.toLocaleString()}
      />
    </Card>
  );
}
