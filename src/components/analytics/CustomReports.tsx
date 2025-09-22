'use client';

import { 
  Card, 
  Title, 
  Group, 
  Text, 
  Button, 
  Select, 
  MultiSelect, 
  Stack,
  Skeleton,
  Table,
  ScrollArea,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea
} from '@mantine/core';
import { LineChart, BarChart, AreaChart } from '@mantine/charts';
import { IconPlus, IconDownload, IconEye, IconTrash, IconEdit } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { mockAnalyticsService, AnalyticsFilters } from '@/lib/mock-services/analyticsService';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  filters: AnalyticsFilters;
  groupBy: 'day' | 'week' | 'month' | 'year';
  chartType: 'line' | 'bar' | 'area';
  createdAt: Date;
  lastRun: Date;
}

interface CustomReportsProps {
  filters?: AnalyticsFilters;
}

export function CustomReports({ filters }: CustomReportsProps) {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [reportData, setReportData] = useState<Array<Record<string, any>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    metrics: [] as string[],
    groupBy: 'month' as 'day' | 'week' | 'month' | 'year',
    chartType: 'line' as 'line' | 'bar' | 'area'
  });

  const availableMetrics = [
    { value: 'alumni_count', label: 'Alumni Count' },
    { value: 'donations_amount', label: 'Donations Amount' },
    { value: 'donations_count', label: 'Donations Count' },
    { value: 'events_count', label: 'Events Count' },
    { value: 'event_attendance', label: 'Event Attendance' },
    { value: 'engagement_rate', label: 'Engagement Rate' },
    { value: 'new_registrations', label: 'New Registrations' },
    { value: 'communications_sent', label: 'Communications Sent' },
    { value: 'page_views', label: 'Page Views' },
    { value: 'active_users', label: 'Active Users' }
  ];

  // Initialize with some sample reports
  useEffect(() => {
    const sampleReports: CustomReport[] = [
      {
        id: '1',
        name: 'Monthly Alumni Growth',
        description: 'Track alumni registration growth over time',
        metrics: ['alumni_count', 'new_registrations'],
        filters: {},
        groupBy: 'month',
        chartType: 'line',
        createdAt: new Date(2024, 0, 15),
        lastRun: new Date(2024, 2, 10)
      },
      {
        id: '2',
        name: 'Donation Performance',
        description: 'Monitor donation amounts and frequency',
        metrics: ['donations_amount', 'donations_count'],
        filters: {},
        groupBy: 'month',
        chartType: 'bar',
        createdAt: new Date(2024, 1, 1),
        lastRun: new Date(2024, 2, 8)
      },
      {
        id: '3',
        name: 'Event Engagement',
        description: 'Analyze event creation and attendance trends',
        metrics: ['events_count', 'event_attendance'],
        filters: {},
        groupBy: 'month',
        chartType: 'area',
        createdAt: new Date(2024, 1, 20),
        lastRun: new Date(2024, 2, 5)
      }
    ];
    setReports(sampleReports);
  }, []);

  const runReport = async (report: CustomReport) => {
    try {
      setLoading(true);
      setSelectedReport(report);
      
      const response = await mockAnalyticsService.getCustomReport(
        report.metrics,
        { ...report.filters, ...filters },
        report.groupBy
      );
      
      setReportData(response.data);
      
      // Update last run time
      setReports(prev => prev.map(r => 
        r.id === report.id 
          ? { ...r, lastRun: new Date() }
          : r
      ));
    } catch (error) {
      console.error('Failed to run report:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = () => {
    if (!newReport.name || newReport.metrics.length === 0) return;

    const report: CustomReport = {
      id: Date.now().toString(),
      name: newReport.name,
      description: newReport.description,
      metrics: newReport.metrics,
      filters: filters || {},
      groupBy: newReport.groupBy,
      chartType: newReport.chartType,
      createdAt: new Date(),
      lastRun: new Date()
    };

    setReports(prev => [...prev, report]);
    setCreateModalOpen(false);
    setNewReport({
      name: '',
      description: '',
      metrics: [],
      groupBy: 'month',
      chartType: 'line'
    });
    
    // Automatically run the new report
    runReport(report);
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
      setReportData(null);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf' | 'excel') => {
    if (!selectedReport) return;
    
    try {
      const response = await mockAnalyticsService.exportData(
        'analytics',
        format,
        { ...selectedReport.filters, ...filters }
      );
      
      // Simulate download
      console.log(`Exporting report "${selectedReport.name}" as ${format.toUpperCase()}`);
      console.log('Download URL:', response.data.downloadUrl);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const renderChart = () => {
    if (!reportData || !selectedReport) return null;

    const chartProps = {
      h: 400,
      data: reportData,
      dataKey: 'period',
      series: selectedReport.metrics.map((metric, index) => ({
        name: metric,
        color: `var(--mantine-color-blue-${6 + (index % 3)})`
      })),
      withTooltip: true,
      tooltipAnimationDuration: 200,
      gridAxis: 'xy' as const,
      tickLine: 'xy' as const
    };

    switch (selectedReport.chartType) {
      case 'line':
        return (
          <LineChart
            {...chartProps}
            curveType="monotone"
            strokeWidth={3}
            dotProps={{ r: 4, strokeWidth: 2 }}
            activeDotProps={{ r: 6, strokeWidth: 2 }}
          />
        );
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'area':
        return (
          <AreaChart
            {...chartProps}
            curveType="monotone"
            strokeWidth={2}
            fillOpacity={0.3}
            withDots={false}
          />
        );
      default:
        return <LineChart {...chartProps} />;
    }
  };

  return (
    <Stack gap="md">
      {/* Reports List */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>Custom Reports</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Report
          </Button>
        </Group>

        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Metrics</Table.Th>
                <Table.Th>Last Run</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.map((report) => (
                <Table.Tr key={report.id}>
                  <Table.Td>
                    <Text fw={500}>{report.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{report.description}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {report.metrics.slice(0, 2).map(metric => (
                        <Badge key={metric} size="sm" variant="light">
                          {availableMetrics.find(m => m.value === metric)?.label || metric}
                        </Badge>
                      ))}
                      {report.metrics.length > 2 && (
                        <Badge size="sm" variant="light" color="gray">
                          +{report.metrics.length - 2}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {report.lastRun.toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        onClick={() => runReport(report)}
                        loading={loading && selectedReport?.id === report.id}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => deleteReport(report.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Report Visualization */}
      {selectedReport && (
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <div>
              <Title order={4}>{selectedReport.name}</Title>
              <Text size="sm" c="dimmed">{selectedReport.description}</Text>
            </div>
            
            <Group>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={14} />}
                onClick={() => exportReport('csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={14} />}
                onClick={() => exportReport('pdf')}
              >
                Export PDF
              </Button>
            </Group>
          </Group>

          {loading ? (
            <Skeleton height={400} />
          ) : reportData ? (
            renderChart()
          ) : (
            <div style={{ 
              height: 400, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'var(--mantine-color-gray-0)',
              borderRadius: 'var(--mantine-radius-md)'
            }}>
              <Text c="dimmed">Select a report to view data</Text>
            </div>
          )}
        </Card>
      )}

      {/* Create Report Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Custom Report"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Report Name"
            placeholder="Enter report name"
            value={newReport.name}
            onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter report description"
            value={newReport.description}
            onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />

          <MultiSelect
            label="Metrics"
            placeholder="Select metrics to include"
            data={availableMetrics}
            value={newReport.metrics}
            onChange={(metrics) => setNewReport(prev => ({ ...prev, metrics }))}
            required
          />

          <Group grow>
            <Select
              label="Group By"
              data={[
                { value: 'day', label: 'Daily' },
                { value: 'week', label: 'Weekly' },
                { value: 'month', label: 'Monthly' },
                { value: 'year', label: 'Yearly' }
              ]}
              value={newReport.groupBy}
              onChange={(value) => setNewReport(prev => ({ 
                ...prev, 
                groupBy: value as 'day' | 'week' | 'month' | 'year' 
              }))}
            />

            <Select
              label="Chart Type"
              data={[
                { value: 'line', label: 'Line Chart' },
                { value: 'bar', label: 'Bar Chart' },
                { value: 'area', label: 'Area Chart' }
              ]}
              value={newReport.chartType}
              onChange={(value) => setNewReport(prev => ({ 
                ...prev, 
                chartType: value as 'line' | 'bar' | 'area' 
              }))}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createReport}>
              Create Report
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}