import {
  Card,
  Title,
  Stack,
  Text,
  Button,
  Skeleton,
  ScrollArea,
  Group,
} from '@mantine/core';
import { IconRefresh, IconActivity } from '@tabler/icons-react';
import { ActivityCard } from '@/components/ui/ActivityCard';
import { useApi } from '@/hooks/useApi';
import { useCallback } from 'react';
import { mockDashboardService } from '@/lib/mock-services/dashboardService';
import { RecentActivity } from '@/services/api';

interface RecentActivitiesFeedProps {
  height?: number;
  maxItems?: number;
}

export function RecentActivitiesFeed({
  height = 400,
  maxItems = 10,
}: RecentActivitiesFeedProps) {
  const apiCall = useCallback(() => mockDashboardService.getRecentActivities(maxItems).then(res => res.data), [maxItems]);

  const {
    data: activities,
    loading,
    error,
    refetch,
  } = useApi(apiCall, {
    showErrorNotification: false, // Don't show notifications for this component
    immediate: true,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg" h={height}>
        <Group justify="space-between" mb="md">
          <Title order={3}>Recent Activities</Title>
          <Skeleton height={32} width={80} />
        </Group>
        <Stack gap="sm">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} withBorder={false} p="md">
              <Group gap="md">
                <Skeleton height={32} width={32} radius="xl" />
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group justify="space-between">
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={12} width={60} />
                  </Group>
                  <Skeleton height={14} width="80%" />
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg" h={height}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconActivity size={20} />
          <Title order={3}>Recent Activities</Title>
        </Group>
        <Button
          variant="subtle"
          size="sm"
          leftSection={<IconRefresh size={16} />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </Group>

      {!activities || activities.length === 0 ? (
        <Stack align="center" justify="center" h="60%">
          <IconActivity size={48} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" ta="center">
            No recent activities found
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Activities will appear here as they happen
          </Text>
        </Stack>
      ) : (
        <ScrollArea h={height - 100}>
          <Stack gap="xs">
            {activities?.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Card>
  );
}
