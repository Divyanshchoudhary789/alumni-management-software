import { Card, Title, Skeleton } from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { useState, useEffect } from 'react';
import { mockChartData } from '@/lib/mock-data';

interface MemberActivityChartProps {
  height?: number;
}

export function MemberActivityChart({ height = 300 }: MemberActivityChartProps) {
  const [data, setData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Transform mock data for pie chart
        const colors = ['blue.6', 'green.6', 'yellow.6', 'red.6', 'purple.6', 'orange.6'];
        const transformedData = mockChartData.memberActivity.map((item, index) => ({
          name: item.category,
          value: item.count,
          color: colors[index % colors.length]
        }));
        
        setData(transformedData);
      } catch (error) {
        console.error('Failed to load member activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Title order={3} mb="md">Member Activity</Title>
        <Skeleton height={height} />
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={3} mb="md">Member Activity</Title>
      
      <PieChart
        h={height}
        data={data}
        withLabelsLine
        labelsPosition="outside"
        labelsType="percent"
        withTooltip
        tooltipDataSource="segment"
        mx="auto"
        strokeWidth={1}
        valueFormatter={(value) => value.toLocaleString()}
      />
    </Card>
  );
}