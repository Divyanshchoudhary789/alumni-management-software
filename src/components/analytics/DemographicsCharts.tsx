'use client';

import { Card, Title, Group, Select, Skeleton, Text, SimpleGrid } from '@mantine/core';
import { BarChart, PieChart, DonutChart } from '@mantine/charts';
import { useState, useEffect } from 'react';
import { mockAnalyticsService, DemographicsData, AnalyticsFilters } from '@/lib/mock-services/analyticsService';

interface DemographicsChartsProps {
  filters?: AnalyticsFilters;
}

export function DemographicsCharts({ filters }: DemographicsChartsProps) {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'donut'>('bar');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await mockAnalyticsService.getDemographicsData(filters);
        setData(response.data);
      } catch (error) {
        console.error('Failed to load demographics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} withBorder radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Skeleton height={24} width="40%" />
              <Skeleton height={36} width={120} />
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
        <Text c="dimmed" ta="center">Failed to load demographics data</Text>
      </Card>
    );
  }

  const graduationYearData = data.graduationYears.slice(0, 10).map(item => ({
    year: item.year.toString(),
    count: item.count,
    Alumni: item.count
  }));

  const locationData = data.locations.slice(0, 8).map(item => ({
    name: item.location,
    value: item.count,
    color: `var(--mantine-color-blue-${Math.floor(Math.random() * 3) + 4})`
  }));

  const companyData = data.companies.slice(0, 10).map(item => ({
    company: item.company.length > 15 ? item.company.substring(0, 15) + '...' : item.company,
    count: item.count,
    Employees: item.count
  }));

  const degreeData = data.degrees.map(item => ({
    name: item.degree,
    value: item.count,
    color: `var(--mantine-color-teal-${Math.floor(Math.random() * 3) + 4})`
  }));

  const industryData = data.industries.slice(0, 8).map(item => ({
    industry: item.industry,
    count: item.count,
    Alumni: item.count
  }));

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      {/* Graduation Years */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>Alumni by Graduation Year</Title>
          <Select
            value={chartType}
            onChange={(value) => setChartType(value as 'bar' | 'pie' | 'donut')}
            data={[
              { value: 'bar', label: 'Bar Chart' },
              { value: 'pie', label: 'Pie Chart' },
              { value: 'donut', label: 'Donut Chart' }
            ]}
            size="sm"
            w={120}
          />
        </Group>
        
        {chartType === 'bar' ? (
          <BarChart
            h={300}
            data={graduationYearData}
            dataKey="year"
            series={[{ name: 'Alumni', color: 'blue.6' }]}
            tickLine="y"
            gridAxis="y"
            withTooltip
            tooltipAnimationDuration={200}
          />
        ) : chartType === 'pie' ? (
          <PieChart
            h={300}
            data={graduationYearData.map(item => ({
              name: item.year,
              value: item.count,
              color: `var(--mantine-color-blue-${Math.floor(Math.random() * 3) + 4})`
            }))}
            withTooltip
            tooltipDataSource="segment"
            mx="auto"
          />
        ) : (
          <DonutChart
            h={300}
            data={graduationYearData.map(item => ({
              name: item.year,
              value: item.count,
              color: `var(--mantine-color-blue-${Math.floor(Math.random() * 3) + 4})`
            }))}
            withTooltip
            tooltipDataSource="segment"
            mx="auto"
          />
        )}
      </Card>

      {/* Geographic Distribution */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Geographic Distribution</Title>
        <DonutChart
          h={300}
          data={locationData}
          withTooltip
          tooltipDataSource="segment"
          mx="auto"
          withLabelsLine
          withLabels
        />
      </Card>

      {/* Top Companies */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Top Employers</Title>
        <BarChart
          h={300}
          data={companyData}
          dataKey="company"
          series={[{ name: 'Employees', color: 'teal.6' }]}
          tickLine="y"
          gridAxis="y"
          withTooltip
          tooltipAnimationDuration={200}
        />
      </Card>

      {/* Degree Distribution */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Degree Distribution</Title>
        <PieChart
          h={300}
          data={degreeData}
          withTooltip
          tooltipDataSource="segment"
          mx="auto"
          withLabelsLine
          withLabels
        />
      </Card>

      {/* Industry Distribution */}
      <Card withBorder radius="md" p="lg" style={{ gridColumn: 'span 2' }}>
        <Title order={4} mb="md">Industry Distribution</Title>
        <BarChart
          h={300}
          data={industryData}
          dataKey="industry"
          series={[{ name: 'Alumni', color: 'violet.6' }]}
          tickLine="y"
          gridAxis="y"
          withTooltip
          tooltipAnimationDuration={200}
        />
      </Card>
    </SimpleGrid>
  );
}