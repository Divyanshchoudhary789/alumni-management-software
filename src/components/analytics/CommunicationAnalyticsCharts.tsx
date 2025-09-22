'use client';

import { Card, Title, Group, Text, SimpleGrid, Skeleton, Badge, Progress, RingProgress } from '@mantine/core';
import { BarChart, LineChart, AreaChart } from '@mantine/charts';
import { IconMail, IconEye, IconClick, IconSend } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { mockAnalyticsService, CommunicationAnalytics, AnalyticsFilters } from '@/lib/mock-services/analyticsService';

interface CommunicationAnalyticsChartsProps {
  filters?: AnalyticsFilters;
}

export function CommunicationAnalyticsCharts({ filters }: CommunicationAnalyticsChartsProps) {
  const [data, setData] = useState<CommunicationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await mockAnalyticsService.getCommunicationAnalytics(filters);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load communication analytics:', error);
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
        <Text c="dimmed" ta="center">Failed to load communication analytics data</Text>
      </Card>
    );
  }

  const engagementByTypeData = data.engagementByType.map(item => ({
    type: item.type,
    sent: item.sent,
    opened: item.opened,
    clicked: item.clicked,
    Sent: item.sent,
    Opened: item.opened,
    Clicked: item.clicked,
    openRate: (item.opened / item.sent) * 100,
    clickRate: (item.clicked / item.opened) * 100
  }));

  const monthlyTrendData = data.monthlyTrends.map(item => ({
    month: item.month,
    sent: item.sent,
    opened: item.opened,
    Sent: item.sent,
    Opened: item.opened
  }));

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      {/* Communication Overview Stats */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed" fw={500}>Total Communications</Text>
          <IconMail size={20} color="var(--mantine-color-blue-6)" />
        </Group>
        <Text size="xl" fw={700} mb="md">{data.totalCommunications}</Text>
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Delivery Rate</Text>
          <Badge size="sm" variant="light" color="green">
            {data.deliveryRate.toFixed(1)}%
          </Badge>
        </Group>
        
        <Progress 
          value={data.deliveryRate} 
          size="sm" 
          color="green"
          mb="md"
        />
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Open Rate</Text>
          <Badge size="sm" variant="light" color={data.openRate > 25 ? 'green' : 'orange'}>
            {data.openRate.toFixed(1)}%
          </Badge>
        </Group>
        
        <Progress 
          value={data.openRate} 
          size="sm" 
          color={data.openRate > 25 ? 'green' : data.openRate > 15 ? 'yellow' : 'red'}
          mb="md"
        />
        
        <Group justify="space-between" mb="xs">
          <Text size="sm" c="dimmed">Click Rate</Text>
          <Badge size="sm" variant="light" color={data.clickRate > 5 ? 'green' : 'orange'}>
            {data.clickRate.toFixed(1)}%
          </Badge>
        </Group>
        
        <Progress 
          value={data.clickRate} 
          size="sm" 
          color={data.clickRate > 5 ? 'green' : data.clickRate > 2 ? 'yellow' : 'red'}
        />
      </Card>

      {/* Engagement Metrics Visualization */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Engagement Metrics</Title>
        <Group justify="center" gap="xl">
          <div style={{ textAlign: 'center' }}>
            <RingProgress
              size={120}
              thickness={12}
              sections={[{ value: data.deliveryRate, color: 'green' }]}
              label={
                <Text ta="center" fw={700} size="sm">
                  {data.deliveryRate.toFixed(1)}%
                </Text>
              }
            />
            <Text size="xs" c="dimmed" mt="xs">Delivery Rate</Text>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <RingProgress
              size={120}
              thickness={12}
              sections={[{ value: data.openRate, color: data.openRate > 25 ? 'blue' : 'orange' }]}
              label={
                <Text ta="center" fw={700} size="sm">
                  {data.openRate.toFixed(1)}%
                </Text>
              }
            />
            <Text size="xs" c="dimmed" mt="xs">Open Rate</Text>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <RingProgress
              size={120}
              thickness={12}
              sections={[{ value: data.clickRate, color: data.clickRate > 5 ? 'teal' : 'red' }]}
              label={
                <Text ta="center" fw={700} size="sm">
                  {data.clickRate.toFixed(1)}%
                </Text>
              }
            />
            <Text size="xs" c="dimmed" mt="xs">Click Rate</Text>
          </div>
        </Group>
      </Card>

      {/* Engagement by Communication Type */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Engagement by Type</Title>
        <BarChart
          h={300}
          data={engagementByTypeData}
          dataKey="type"
          series={[
            { name: 'Sent', color: 'blue.6' },
            { name: 'Opened', color: 'green.6' },
            { name: 'Clicked', color: 'teal.6' }
          ]}
          tickLine="y"
          gridAxis="y"
          withTooltip
          tooltipAnimationDuration={200}
        />
      </Card>

      {/* Monthly Communication Trends */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Monthly Communication Trends</Title>
        <LineChart
          h={300}
          data={monthlyTrendData}
          dataKey="month"
          series={[
            { name: 'Sent', color: 'blue.6' },
            { name: 'Opened', color: 'green.6' }
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

      {/* Open Rate by Type */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Open Rate by Communication Type</Title>
        <BarChart
          h={300}
          data={engagementByTypeData}
          dataKey="type"
          series={[{ name: 'openRate', color: 'violet.6', label: 'Open Rate (%)' }]}
          tickLine="y"
          gridAxis="y"
          withTooltip
          tooltipAnimationDuration={200}
          valueFormatter={(value) => `${value.toFixed(1)}%`}
        />
      </Card>

      {/* Communication Volume Trends */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Communication Volume</Title>
        <AreaChart
          h={300}
          data={monthlyTrendData}
          dataKey="month"
          series={[
            { name: 'Sent', color: 'blue.6' }
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