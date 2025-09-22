import { Card, Title, Skeleton } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useState, useEffect } from 'react';
import { mockDashboardService } from '@/lib/mock-services';

interface EventAttendanceChartProps {
  height?: number;
}

export function EventAttendanceChart({ height = 300 }: EventAttendanceChartProps) {
  const [data, setData] = useState<Array<{ eventName: string; registered: number; attended: number; capacity: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await mockDashboardService.getEventAttendanceData();
        setData(response.data);
      } catch (error) {
        console.error('Failed to load event attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Title order={3} mb="md">Event Attendance</Title>
        <Skeleton height={height} />
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={3} mb="md">Event Attendance</Title>
      
      <BarChart
        h={height}
        data={data}
        dataKey="eventName"
        series={[
          { name: 'registered', label: 'Registered', color: 'blue.6' },
          { name: 'attended', label: 'Attended', color: 'green.6' },
          { name: 'capacity', label: 'Capacity', color: 'gray.4' }
        ]}
        tickLine="y"
        gridAxis="y"
        xAxisLabel="Events"
        yAxisLabel="Number of People"
        withTooltip
        tooltipAnimationDuration={200}
        valueFormatter={(value) => value.toLocaleString()}
        withLegend
        legendProps={{ verticalAlign: 'top', height: 50 }}
      />
    </Card>
  );
}