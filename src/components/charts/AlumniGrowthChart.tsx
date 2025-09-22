import { Card, Title, Group, Select, Skeleton } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useState, useEffect } from 'react';
import { mockDashboardService } from '@/lib/mock-services';

interface AlumniGrowthChartProps {
  height?: number;
}

export function AlumniGrowthChart({ height = 300 }: AlumniGrowthChartProps) {
  const [data, setData] = useState<Array<{ period: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await mockDashboardService.getAlumniGrowthData(period);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load alumni growth data:', error);
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
          <Title order={3}>Alumni Growth</Title>
          <Skeleton height={36} width={120} />
        </Group>
        <Skeleton height={height} />
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <Title order={3}>Alumni Growth</Title>
        <Select
          value={period}
          onChange={(value) => setPeriod(value as 'month' | 'quarter' | 'year')}
          data={[
            { value: 'month', label: 'Monthly' },
            { value: 'quarter', label: 'Quarterly' },
            { value: 'year', label: 'Yearly' }
          ]}
          size="sm"
          w={120}
        />
      </Group>
      
      <LineChart
        h={height}
        data={data}
        dataKey="period"
        series={[
          { name: 'count', label: 'Alumni Count', color: 'blue.6' }
        ]}
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
        valueFormatter={(value) => value.toLocaleString()}
      />
    </Card>
  );
}