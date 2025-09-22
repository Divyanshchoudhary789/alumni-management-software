'use client';

import { Container, Title, Text, Tabs, Stack, Group, Badge } from '@mantine/core';
import { IconChartBar, IconUsers, IconCalendarEvent, IconCurrencyDollar, IconMail, IconEye, IconReportAnalytics } from '@tabler/icons-react';
import { useState } from 'react';
import {
  AnalyticsOverview,
  DemographicsCharts,
  EventAnalyticsCharts,
  DonationAnalyticsCharts,
  CommunicationAnalyticsCharts,
  AnalyticsFilters,
  RealTimeAnalytics,
  CustomReports
} from '@/components/analytics';
import { AnalyticsFilters as FilterType } from '@/lib/mock-services/analyticsService';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filters, setFilters] = useState<FilterType>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    // This would trigger export for the current tab's data
    console.log(`Exporting ${activeTab} data as ${format.toUpperCase()}`);
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Analytics & Reports</Title>
          <Text c="dimmed" mt="sm">
            Comprehensive analytics dashboard with real-time insights and custom reporting
          </Text>
        </div>
        <Badge variant="light" color="blue" size="lg">
          Live Data
        </Badge>
      </Group>

      <Stack gap="md">
        {/* Analytics Filters */}
        <AnalyticsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
        />

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
          <Tabs.List>
            <Tabs.Tab 
              value="overview" 
              leftSection={<IconChartBar size={16} />}
            >
              Overview
            </Tabs.Tab>
            <Tabs.Tab 
              value="demographics" 
              leftSection={<IconUsers size={16} />}
            >
              Demographics
            </Tabs.Tab>
            <Tabs.Tab 
              value="events" 
              leftSection={<IconCalendarEvent size={16} />}
            >
              Events
            </Tabs.Tab>
            <Tabs.Tab 
              value="donations" 
              leftSection={<IconCurrencyDollar size={16} />}
            >
              Donations
            </Tabs.Tab>
            <Tabs.Tab 
              value="communications" 
              leftSection={<IconMail size={16} />}
            >
              Communications
            </Tabs.Tab>
            <Tabs.Tab 
              value="realtime" 
              leftSection={<IconEye size={16} />}
            >
              Real-time
            </Tabs.Tab>
            <Tabs.Tab 
              value="reports" 
              leftSection={<IconReportAnalytics size={16} />}
            >
              Custom Reports
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <AnalyticsOverview 
              key={`overview-${refreshKey}`}
              dateRange={filters.dateRange} 
            />
          </Tabs.Panel>

          <Tabs.Panel value="demographics" pt="md">
            <DemographicsCharts 
              key={`demographics-${refreshKey}`}
              filters={filters} 
            />
          </Tabs.Panel>

          <Tabs.Panel value="events" pt="md">
            <EventAnalyticsCharts 
              key={`events-${refreshKey}`}
              filters={filters} 
            />
          </Tabs.Panel>

          <Tabs.Panel value="donations" pt="md">
            <DonationAnalyticsCharts 
              key={`donations-${refreshKey}`}
              filters={filters} 
            />
          </Tabs.Panel>

          <Tabs.Panel value="communications" pt="md">
            <CommunicationAnalyticsCharts 
              key={`communications-${refreshKey}`}
              filters={filters} 
            />
          </Tabs.Panel>

          <Tabs.Panel value="realtime" pt="md">
            <RealTimeAnalytics key={`realtime-${refreshKey}`} />
          </Tabs.Panel>

          <Tabs.Panel value="reports" pt="md">
            <CustomReports 
              key={`reports-${refreshKey}`}
              filters={filters} 
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}