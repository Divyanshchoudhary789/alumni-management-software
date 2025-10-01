import { Card, Title, Skeleton, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { mockEventService } from '@/lib/mock-services/eventService';

interface EventAttendanceChartProps {
  height?: number;
}

export function EventAttendanceChart({
  height = 300,
}: EventAttendanceChartProps) {
  // Fetch events statistics for the chart
  const apiCall = useCallback(() => mockEventService.getEventStats().then(res => res.data), []);

  const {
    data: eventsStats,
    loading,
    error,
  } = useApi(apiCall, {
    showErrorNotification: false,
    immediate: true,
  });

  // Transform data for chart (using mock data structure for now)
  const chartData = eventsStats
    ? [
        {
          eventName: 'Total Events',
          registered: eventsStats.totalRegistrations || 0,
          attended: Math.round((eventsStats.totalRegistrations || 0) * 0.8), // Assume 80% attendance
          capacity: eventsStats.totalEvents * 50, // Assume average capacity of 50
        },
      ]
    : [];

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Title order={3} mb="md">
          Event Attendance
        </Title>
        <Skeleton height={height} />
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card withBorder radius="md" p="lg">
        <Title order={3} mb="md">
          Event Attendance
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
        Event Attendance
      </Title>

      <BarChart
        h={height}
        data={chartData}
        dataKey="eventName"
        series={[
          { name: 'registered', label: 'Registered', color: 'blue.6' },
          { name: 'attended', label: 'Attended', color: 'green.6' },
          { name: 'capacity', label: 'Capacity', color: 'gray.4' },
        ]}
        tickLine="y"
        gridAxis="y"
        xAxisLabel="Events"
        yAxisLabel="Number of People"
        withTooltip
        tooltipAnimationDuration={200}
        valueFormatter={value => value.toLocaleString()}
        withLegend
        legendProps={{ verticalAlign: 'top', height: 50 }}
      />
    </Card>
  );
}
