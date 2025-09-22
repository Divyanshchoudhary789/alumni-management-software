'use client';

import { Card, Title, Group, Text, SimpleGrid, Skeleton, Badge, Progress, RingProgress } from '@mantine/core';
import { BarChart, LineChart, AreaChart } from '@mantine/charts';
import { IconCalendarEvent, IconUsers, IconTrendingUp, IconPercentage } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { mockAnalyticsService, EventAnalytics, AnalyticsFilters } from '@/lib/mock-services/analyticsService';

interface EventAnalyticsChartsProps {
  filters?: AnalyticsFilters;
}

export function EventAnalyticsCharts({ filters }: EventAnalyticsChartsProps) {
  const [data, setData] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await mockAnalyticsService.getEventAnalytics(filters);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load event analytics:', error);
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
        <Text c="dimmed" ta="center">Failed to load event analytics data</Text>
      </Card>
    );
  }

  const eventTypeData = data.popularEventTypes.map(item => ({
    type: item.type,
    count: item.count,
    avgAttendance: item.avgAttendance,
    Events: item.count,
    'Avg Attendance': item.avgAttendance
  }));

  const monthlyTrendData = data.monthlyEventTrends.map(item => ({
    month: item.month,
    events: item.events,
    attendance: item.attendance,
    Events: item.events,
    Attendance: item.attendance
  }));

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      {/* Event Overview Stats */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>Total Events</Text>
          <IconCalendarEvent size={20} color="var(--mantine-color-blue-6)" />
        </Group>
        <Text size="xl" fw={700} mb="md">{data.totalEvents}</Text>
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Average Attendance</Text>
          <Text size="sm" fw={500}>{data.averageAttendance.toFixed(1)}</Text>
        </Group>
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Attendance Rate</Text>
          <Badge size="sm" variant="light" color={data.attendanceRate > 70 ? 'green' : 'orange'}>
            {data.attendanceRate.toFixed(1)}%
          </Badge>
        </Group>
        
        <Progress 
          value={data.attendanceRate} 
          size="sm" 
          color={data.attendanceRate > 70 ? 'green' : data.attendanceRate > 50 ? 'yellow' : 'red'}
          mt="md"
        />
      </Card>

      {/* Capacity Utilization */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>Capacity Utilization</Text>
          <IconPercentage size={20} color="var(--mantine-color-teal-6)" />
        </Group>
        
        <Group justify="center" mt="md">
          <RingProgress
            size={200}
            thickness={20}
            sections={[
              { 
                value: data.capacityUtilization, 
                color: data.capacityUtilization > 80 ? 'red' : data.capacityUtilization > 60 ? 'yellow' : 'teal' 
              }
            ]}
            label={
              <Text ta="center" fw={700} size="xl">
                {data.capacityUtilization.toFixed(1)}%
              </Text>
            }
          />
        </Group>
        
        <Text size="sm" c="dimmed" ta="center" mt="md">
          {data.capacityUtilization > 80 
            ? 'High demand - consider larger venues' 
            : data.capacityUtilization > 60 
            ? 'Good utilization' 
            : 'Room for growth'
          }
        </Text>
      </Card>

      {/* Popular Event Types */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Popular Event Types</Title>
        <BarChart
          h={300}
          data={eventTypeData}
          dataKey="type"
          series={[
            { name: 'Events', color: 'blue.6' },
            { name: 'Avg Attendance', color: 'teal.6' }
          ]}
          tickLine="y"
          gridAxis="y"
          withTooltip
          tooltipAnimationDuration={200}
        />
      </Card>

      {/* Monthly Event Trends */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Monthly Event Trends</Title>
        <LineChart
          h={300}
          data={monthlyTrendData}
          dataKey="month"
          series={[
            { name: 'Events', color: 'blue.6' },
            { name: 'Attendance', color: 'green.6' }
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

      {/* Event Performance Summary */}
      <Card withBorder radius="md" p="lg" style={{ gridColumn: 'span 2' }}>
        <Title order={4} mb="md">Event Performance Overview</Title>
        <AreaChart
          h={300}
          data={monthlyTrendData}
          dataKey="month"
          series={[
            { name: 'Attendance', color: 'blue.6' }
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
    </SimpleGrid>
  );
}