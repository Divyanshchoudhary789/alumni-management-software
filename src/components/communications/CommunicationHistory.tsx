'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  TextInput,
  Select,
  Button,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  Alert,
  Pagination,
  Table,
  Tooltip,
  LoadingOverlay,
  Box,
  Card,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconSend,
  IconClock,
  IconCheck,
  IconX,
  IconMail,
  IconUsers,
  IconCalendar,
  IconRefresh,
  IconChartBar,
  IconTrendingUp,
  IconMouse,
  IconMailOpened,
} from '@tabler/icons-react';
import { Communication } from '@/types';
import {
  mockCommunicationService,
  CommunicationFilters,
} from '@/lib/mock-services/communicationService';

const statusColors = {
  draft: 'gray',
  scheduled: 'blue',
  sent: 'green',
  failed: 'red',
};

const statusIcons = {
  draft: IconEdit,
  scheduled: IconClock,
  sent: IconCheck,
  failed: IconX,
};

const typeLabels: Record<string, string> = {
  newsletter: 'Newsletter',
  event_invitation: 'Event Invitation',
  announcement: 'Announcement',
  fundraising: 'Fundraising',
  program_launch: 'Program Launch',
  donation_receipt: 'Donation Receipt',
  welcome: 'Welcome Message',
  reminder: 'Reminder',
};

const typeColors: Record<string, string> = {
  newsletter: 'blue',
  event_invitation: 'green',
  announcement: 'orange',
  fundraising: 'red',
  program_launch: 'purple',
  donation_receipt: 'teal',
  welcome: 'cyan',
  reminder: 'yellow',
};

export function CommunicationHistory() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [
    deleteConfirmOpened,
    { open: openDeleteConfirm, close: closeDeleteConfirm },
  ] = useDisclosure(false);
  const [stats, setStats] = useState<any>(null);
  const [analyticsOpened, { open: openAnalytics, close: closeAnalytics }] =
    useDisclosure(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<CommunicationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const audienceOptions = [
    { value: 'all', label: 'All Alumni' },
    { value: 'recent_graduates', label: 'Recent Graduates' },
    { value: 'tech', label: 'Technology Alumni' },
    { value: 'business', label: 'Business Alumni' },
    { value: 'engineering', label: 'Engineering Alumni' },
    { value: 'donors', label: 'Donors' },
    { value: 'entrepreneurs', label: 'Entrepreneurs' },
  ];

  const loadCommunications = async () => {
    setLoading(true);
    try {
      const response = await mockCommunicationService.getCommunications(
        { ...filters, search: searchQuery },
        { field: 'createdAt', direction: 'desc' },
        currentPage,
        10
      );

      setCommunications(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to load communications',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await mockCommunicationService.getCommunicationStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, [currentPage, filters, searchQuery]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    loadCommunications();
  };

  const handleFilterChange = (newFilters: Partial<CommunicationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedCommunication) return;

    try {
      await mockCommunicationService.deleteCommunication(
        selectedCommunication.id
      );
      notifications.show({
        title: 'Success',
        message: 'Communication deleted successfully',
        color: 'green',
      });
      loadCommunications();
      closeDeleteConfirm();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete communication',
        color: 'red',
      });
    }
  };

  const handleResend = async (communication: Communication) => {
    try {
      await mockCommunicationService.sendCommunication(communication.id);
      notifications.show({
        title: 'Success',
        message: 'Communication sent successfully',
        color: 'green',
      });
      loadCommunications();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to send communication',
        color: 'red',
      });
    }
  };

  const StatusIcon = ({ status }: { status: Communication['status'] }) => {
    const Icon = statusIcons[status];
    return <Icon size={16} />;
  };

  return (
    <Stack gap="md">
      {/* Statistics Cards */}
      {stats && (
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Total Communications
                </Text>
                <Text fw={700} size="xl">
                  {stats.totalCommunications}
                </Text>
              </div>
              <IconMail size={24} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Sent
                </Text>
                <Text fw={700} size="xl" c="green">
                  {stats.sent}
                </Text>
              </div>
              <IconCheck size={24} color="var(--mantine-color-green-6)" />
            </Group>
          </Card>

          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Scheduled
                </Text>
                <Text fw={700} size="xl" c="blue">
                  {stats.scheduled}
                </Text>
              </div>
              <IconClock size={24} color="var(--mantine-color-blue-6)" />
            </Group>
          </Card>

          <Card withBorder>
            <Group justify="space-between">
              <div>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Drafts
                </Text>
                <Text fw={700} size="xl" c="gray">
                  {stats.drafts}
                </Text>
              </div>
              <IconEdit size={24} color="var(--mantine-color-gray-6)" />
            </Group>
          </Card>
        </SimpleGrid>
      )}

      <Paper p="md" withBorder>
        <LoadingOverlay visible={loading} />

        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between">
            <Text size="lg" fw={600}>
              Communication History
            </Text>
            <Group gap="xs">
              <Button
                leftSection={<IconChartBar size={16} />}
                variant="light"
                onClick={openAnalytics}
              >
                Analytics
              </Button>
              <Button
                leftSection={<IconRefresh size={16} />}
                variant="light"
                onClick={loadCommunications}
              >
                Refresh
              </Button>
            </Group>
          </Group>

          {/* Filters */}
          <Group>
            <TextInput
              placeholder="Search communications..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1 }}
            />

            <Select
              placeholder="Type"
              data={[
                { value: '', label: 'All Types' },
                { value: 'newsletter', label: 'Newsletter' },
                { value: 'event_invitation', label: 'Event Invitation' },
                { value: 'announcement', label: 'Announcement' },
                { value: 'fundraising', label: 'Fundraising' },
              ]}
              value={filters.type || ''}
              onChange={value =>
                handleFilterChange({ type: value || undefined })
              }
              clearable
            />

            <Select
              placeholder="Status"
              data={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'sent', label: 'Sent' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={filters.status || ''}
              onChange={value =>
                handleFilterChange({
                  status: (value as Communication['status']) || undefined,
                })
              }
              clearable
            />

            <Button onClick={handleSearch}>Search</Button>
          </Group>

          {/* Communications Table */}
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Audience</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {communications.map(communication => (
                <Table.Tr key={communication.id}>
                  <Table.Td>
                    <Text fw={500} lineClamp={1}>
                      {communication.title}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {typeLabels[communication.type] || communication.type}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <StatusIcon status={communication.status} />
                      <Badge
                        color={statusColors[communication.status]}
                        variant="light"
                        size="sm"
                      >
                        {communication.status}
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconUsers size={14} />
                      <Text size="sm">
                        {communication.targetAudience.length} group
                        {communication.targetAudience.length !== 1 ? 's' : ''}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconCalendar size={14} />
                      <Text size="sm">
                        {communication.sentDate
                          ? communication.sentDate.toLocaleDateString()
                          : communication.createdAt.toLocaleDateString()}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Preview">
                        <ActionIcon
                          variant="light"
                          size="sm"
                          onClick={() => {
                            setSelectedCommunication(communication);
                            openPreview();
                          }}
                        >
                          <IconEye size={14} />
                        </ActionIcon>
                      </Tooltip>

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {communication.status === 'draft' && (
                            <Menu.Item leftSection={<IconSend size={14} />}>
                              Send Now
                            </Menu.Item>
                          )}

                          {communication.status === 'failed' && (
                            <Menu.Item
                              leftSection={<IconSend size={14} />}
                              onClick={() => handleResend(communication)}
                            >
                              Resend
                            </Menu.Item>
                          )}

                          {communication.status !== 'sent' && (
                            <>
                              <Menu.Item leftSection={<IconEdit size={14} />}>
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => {
                                  setSelectedCommunication(communication);
                                  openDeleteConfirm();
                                }}
                              >
                                Delete
                              </Menu.Item>
                            </>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center">
              <Pagination
                value={currentPage}
                onChange={setCurrentPage}
                total={totalPages}
              />
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Preview Modal */}
      <Modal
        opened={previewOpened}
        onClose={closePreview}
        title="Communication Preview"
        size="lg"
      >
        {selectedCommunication && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={600} size="lg">
                  {selectedCommunication.title}
                </Text>
                <Group gap="xs" mt="xs">
                  <Badge variant="light">
                    {typeLabels[selectedCommunication.type] ||
                      selectedCommunication.type}
                  </Badge>
                  <Badge
                    color={statusColors[selectedCommunication.status]}
                    variant="light"
                  >
                    {selectedCommunication.status}
                  </Badge>
                </Group>
              </div>
            </Group>

            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Target Audience:
              </Text>
              {selectedCommunication.targetAudience.map(audience => (
                <Badge key={audience} size="sm" variant="outline">
                  {audienceOptions.find(a => a.value === audience)?.label ||
                    audience}
                </Badge>
              ))}
            </Group>

            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {selectedCommunication.sentDate ? 'Sent:' : 'Created:'}
              </Text>
              <Text size="sm">
                {(
                  selectedCommunication.sentDate ||
                  selectedCommunication.createdAt
                ).toLocaleString()}
              </Text>
            </Group>

            <Box
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-sm)',
                padding: 'var(--mantine-spacing-md)',
                minHeight: '200px',
                maxHeight: '400px',
                overflow: 'auto',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedCommunication.content,
              }}
            />
          </Stack>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpened}
        onClose={closeDeleteConfirm}
        title="Delete Communication"
        size="md"
      >
        <Stack gap="md">
          <Alert color="red" variant="light">
            <Text size="sm">
              Are you sure you want to delete "{selectedCommunication?.title}"?
              This action cannot be undone.
            </Text>
          </Alert>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeDeleteConfirm}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        opened={analyticsOpened}
        onClose={closeAnalytics}
        title="Communication Analytics & Engagement"
        size="xl"
      >
        <Stack gap="md">
          {/* Engagement Overview */}
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Total Sent
                  </Text>
                  <Text fw={700} size="xl">
                    {stats?.sent || 0}
                  </Text>
                </div>
                <IconMailOpened size={24} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>

            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Avg. Open Rate
                  </Text>
                  <Text fw={700} size="xl" c="green">
                    68.5%
                  </Text>
                </div>
                <IconMouse size={24} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>

            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Click Rate
                  </Text>
                  <Text fw={700} size="xl" c="orange">
                    24.3%
                  </Text>
                </div>
                <IconTrendingUp
                  size={24}
                  color="var(--mantine-color-orange-6)"
                />
              </Group>
            </Card>

            <Card withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Total Reach
                  </Text>
                  <Text fw={700} size="xl">
                    12.4K
                  </Text>
                </div>
                <IconUsers size={24} color="var(--mantine-color-purple-6)" />
              </Group>
            </Card>
          </SimpleGrid>

          {/* Performance by Type */}
          <Card withBorder p="md">
            <Text fw={600} mb="md">
              Performance by Communication Type
            </Text>
            <Stack gap="sm">
              {Object.entries(stats?.typeBreakdown || {}).map(
                ([type, count]) => {
                  // Mock engagement data
                  const openRate = Math.floor(Math.random() * 30) + 50; // 50-80%
                  const clickRate = Math.floor(Math.random() * 20) + 15; // 15-35%

                  return (
                    <Group key={type} justify="space-between">
                      <Group gap="xs">
                        <Badge
                          variant="light"
                          color={typeColors[type] || 'gray'}
                        >
                          {typeLabels[type] || type}
                        </Badge>
                        <Text size="sm" c="dimmed">
                          {count} sent
                        </Text>
                      </Group>
                      <Group gap="md">
                        <Group gap="xs">
                          <Text size="sm" c="dimmed">
                            Open:
                          </Text>
                          <Text size="sm" fw={500} c="green">
                            {openRate}%
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <Text size="sm" c="dimmed">
                            Click:
                          </Text>
                          <Text size="sm" fw={500} c="orange">
                            {clickRate}%
                          </Text>
                        </Group>
                      </Group>
                    </Group>
                  );
                }
              )}
            </Stack>
          </Card>

          {/* Audience Engagement */}
          <Card withBorder p="md">
            <Text fw={600} mb="md">
              Audience Engagement
            </Text>
            <Stack gap="sm">
              {Object.entries(stats?.audienceReach || {})
                .slice(0, 6)
                .map(([audience, count]) => {
                  const engagementRate = Math.floor(Math.random() * 40) + 40; // 40-80%
                  const audienceLabel =
                    audienceOptions.find(a => a.value === audience)?.label ||
                    audience;

                  return (
                    <Group key={audience} justify="space-between">
                      <Group gap="xs">
                        <Text size="sm" fw={500}>
                          {audienceLabel}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {count} communications
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          Engagement:
                        </Text>
                        <Text
                          size="sm"
                          fw={500}
                          c={
                            engagementRate > 60
                              ? 'green'
                              : engagementRate > 40
                                ? 'orange'
                                : 'red'
                          }
                        >
                          {engagementRate}%
                        </Text>
                      </Group>
                    </Group>
                  );
                })}
            </Stack>
          </Card>

          {/* Recent Performance Trends */}
          <Card withBorder p="md">
            <Text fw={600} mb="md">
              Recent Performance Trends
            </Text>
            <Alert color="blue" variant="light">
              <Stack gap="xs">
                <Text size="sm">
                  <strong>📈 Trending Up:</strong> Event invitations showing 15%
                  higher open rates this month
                </Text>
                <Text size="sm">
                  <strong>📊 Insight:</strong> Tuesday and Thursday sends
                  perform 23% better than other days
                </Text>
                <Text size="sm">
                  <strong>🎯 Recommendation:</strong> Consider A/B testing
                  subject lines for newsletter communications
                </Text>
              </Stack>
            </Alert>
          </Card>

          {/* Delivery Status */}
          <Card withBorder p="md">
            <Text fw={600} mb="md">
              Delivery Status Overview
            </Text>
            <SimpleGrid cols={2} spacing="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">Successfully Delivered</Text>
                  <Text size="sm" fw={500} c="green">
                    98.7%
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Bounced</Text>
                  <Text size="sm" fw={500} c="red">
                    1.1%
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Spam Reports</Text>
                  <Text size="sm" fw={500} c="orange">
                    0.2%
                  </Text>
                </Group>
              </Stack>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">Unsubscribes</Text>
                  <Text size="sm" fw={500} c="yellow">
                    0.8%
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Failed Delivery</Text>
                  <Text size="sm" fw={500} c="red">
                    0.3%
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Pending</Text>
                  <Text size="sm" fw={500} c="blue">
                    0.1%
                  </Text>
                </Group>
              </Stack>
            </SimpleGrid>
          </Card>
        </Stack>
      </Modal>
    </Stack>
  );
}
