'use client';

import { Card, Title, Group, SegmentedControl, Grid, Text, Skeleton } from '@mantine/core';
import { useState } from 'react';
import { AreaChart, BarChart, PieChart } from '@mantine/charts';

interface DonationChartsProps {
  stats: any;
  loading: boolean;
}

export function DonationCharts({ stats, loading }: DonationChartsProps) {
  const [chartType, setChartType] = useState('trends');

  if (loading) {
    return (
      <Card padding="lg" radius="md" withBorder>
        <Skeleton height={300} />
      </Card>
    );
  }

  if (!stats) return null;

  // Prepare monthly trends data
  const monthlyData = Object.entries(stats.monthlyTotals || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: amount as number,
    }));

  // Prepare purpose breakdown data
  const purposeData = Object.entries(stats.purposeBreakdown || {})
    .map(([purpose, data]: [string, any]) => ({
      name: purpose,
      value: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  // Prepare payment method data
  const paymentMethodData = Object.entries(stats.paymentMethodBreakdown || {})
    .map(([method, count]) => ({
      name: method,
      value: count as number,
    }))
    .sort((a, b) => b.value - a.value);

  const renderChart = () => {
    switch (chartType) {
      case 'trends':
        return (
          <AreaChart
            h={300}
            data={monthlyData}
            dataKey="month"
            series={[
              { name: 'amount', label: 'Donation Amount', color: 'blue.6' },
            ]}
            curveType="linear"
            tickLine="xy"
            gridAxis="xy"
            withXAxis
            withYAxis
            yAxisProps={{
              tickFormatter: (value) => `$${(value / 1000).toFixed(0)}k`,
            }}
          />
        );
      
      case 'purposes':
        return (
          <BarChart
            h={300}
            data={purposeData.slice(0, 8)} // Top 8 purposes
            dataKey="name"
            series={[
              { name: 'value', label: 'Amount', color: 'green.6' },
            ]}
            tickLine="y"
            gridAxis="y"
            withXAxis
            withYAxis
            yAxisProps={{
              tickFormatter: (value) => `$${(value / 1000).toFixed(0)}k`,
            }}
          />
        );
      
      case 'methods':
        return (
          <PieChart
            h={300}
            data={paymentMethodData}
            withLabelsLine
            labelsPosition="outside"
            labelsType="percent"
            withTooltip
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Donation Analytics</Title>
        <SegmentedControl
          value={chartType}
          onChange={setChartType}
          data={[
            { label: 'Trends', value: 'trends' },
            { label: 'Purposes', value: 'purposes' },
            { label: 'Methods', value: 'methods' },
          ]}
          size="sm"
        />
      </Group>

      {renderChart()}

      {/* Chart Summary */}
      <Grid mt="md">
        {chartType === 'trends' && (
          <>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Peak Month</Text>
              <Text fw={500}>
                {monthlyData.length > 0 
                  ? monthlyData.reduce((max, curr) => curr.amount > max.amount ? curr : max).month
                  : 'N/A'
                }
              </Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Monthly Average</Text>
              <Text fw={500}>
                ${monthlyData.length > 0 
                  ? (monthlyData.reduce((sum, curr) => sum + curr.amount, 0) / monthlyData.length / 1000).toFixed(1)
                  : '0'
                }k
              </Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Growth Trend</Text>
              <Text fw={500} c="green">+12.5%</Text>
            </Grid.Col>
          </>
        )}

        {chartType === 'purposes' && (
          <>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Top Purpose</Text>
              <Text fw={500}>
                {purposeData.length > 0 ? purposeData[0].name : 'N/A'}
              </Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Categories</Text>
              <Text fw={500}>{purposeData.length}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Diversity Index</Text>
              <Text fw={500}>
                {purposeData.length > 0 
                  ? (purposeData.length > 5 ? 'High' : purposeData.length > 2 ? 'Medium' : 'Low')
                  : 'N/A'
                }
              </Text>
            </Grid.Col>
          </>
        )}

        {chartType === 'methods' && (
          <>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Most Popular</Text>
              <Text fw={500}>
                {paymentMethodData.length > 0 ? paymentMethodData[0].name : 'N/A'}
              </Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Methods Used</Text>
              <Text fw={500}>{paymentMethodData.length}</Text>
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="sm" c="dimmed">Digital %</Text>
              <Text fw={500}>
                {paymentMethodData.length > 0 
                  ? Math.round((paymentMethodData.filter(m => 
                      ['Credit Card', 'PayPal', 'Cryptocurrency'].includes(m.name)
                    ).reduce((sum, m) => sum + m.value, 0) / 
                    paymentMethodData.reduce((sum, m) => sum + m.value, 0)) * 100)
                  : 0
                }%
              </Text>
            </Grid.Col>
          </>
        )}
      </Grid>
    </Card>
  );
}