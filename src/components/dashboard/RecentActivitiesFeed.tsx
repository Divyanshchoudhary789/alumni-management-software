import { Card, Title, Stack, Text, Button, Skeleton, ScrollArea, Group } from '@mantine/core';
import { IconRefresh, IconActivity } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { ActivityCard } from '@/components/ui/ActivityCard';
import { mockDashboardService } from '@/lib/mock-services';
import { RecentActivity } from '@/types';

interface RecentActivitiesFeedProps {
  height?: number;
  maxItems?: number;
}

export function RecentActivitiesFeed({ height = 400, maxItems = 10 }: RecentActivitiesFeedProps) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await mockDashboardService.getRecentActivities(maxItems);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [maxItems]);

  const handleRefresh = () => {
    loadActivities(true);
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
          loading={refreshing}
        >
          Refresh
        </Button>
      </Group>

      {activities.length === 0 ? (
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
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Card>
  );
}