'use client';

import { 
  Card, 
  Title, 
  Group, 
  Text, 
  SimpleGrid, 
  Skeleton, 
  Badge, 
  Timeline,
  ScrollArea,
  ActionIcon,
  Indicator
} from '@mantine/core';
import { IconUsers, IconEye, IconUserPlus, IconCurrencyDollar, IconRefresh } from '@tabler/icons-react';
import { useState, useEffect, useRef } from 'react';
import { mockAnalyticsService } from '@/lib/mock-services/analyticsService';

interface RealTimeData {
  activeUsers: number;
  recentActions: Array<{ action: string; timestamp: Date; user?: string }>;
  liveMetrics: {
    pageViews: number;
    newRegistrations: number;
    donations: number;
  };
}

export function RealTimeAnalytics() {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadRealTimeData = async () => {
    try {
      const response = await mockAnalyticsService.getRealTimeUpdates();
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load real-time data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadRealTimeData();

    // Set up real-time updates
    if (isLive) {
      intervalRef.current = setInterval(loadRealTimeData, 5000); // Update every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive]);

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
    if (!isLive) {
      loadRealTimeData();
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Profile Update':
        return <IconUsers size={16} />;
      case 'Event Registration':
        return <IconUserPlus size={16} />;
      case 'Donation':
        return <IconCurrencyDollar size={16} />;
      case 'Login':
        return <IconEye size={16} />;
      default:
        return <IconUsers size={16} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Profile Update':
        return 'blue';
      case 'Event Registration':
        return 'green';
      case 'Donation':
        return 'orange';
      case 'Login':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  };

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} withBorder radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Skeleton height={24} width="60%" />
              <Skeleton height={24} width={24} />
            </Group>
            <Skeleton height={200} />
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  if (!data) {
    return (
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed" ta="center">Failed to load real-time data</Text>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      {/* Live Metrics */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <Title order={4}>Live Metrics</Title>
            <Indicator 
              color={isLive ? 'green' : 'gray'} 
              size={8}
              processing={isLive}
            >
              <Badge 
                variant="light" 
                color={isLive ? 'green' : 'gray'}
                size="sm"
              >
                {isLive ? 'LIVE' : 'PAUSED'}
              </Badge>
            </Indicator>
          </Group>
          
          <ActionIcon
            variant="light"
            onClick={toggleLiveUpdates}
            color={isLive ? 'red' : 'green'}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>

        <SimpleGrid cols={2} spacing="md">
          <div>
            <Group gap="xs" mb="xs">
              <IconUsers size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm" c="dimmed">Active Users</Text>
            </Group>
            <Text size="xl" fw={700}>{data.activeUsers}</Text>
          </div>

          <div>
            <Group gap="xs" mb="xs">
              <IconEye size={16} color="var(--mantine-color-green-6)" />
              <Text size="sm" c="dimmed">Page Views</Text>
            </Group>
            <Text size="xl" fw={700}>{data.liveMetrics.pageViews}</Text>
          </div>

          <div>
            <Group gap="xs" mb="xs">
              <IconUserPlus size={16} color="var(--mantine-color-orange-6)" />
              <Text size="sm" c="dimmed">New Registrations</Text>
            </Group>
            <Text size="xl" fw={700}>{data.liveMetrics.newRegistrations}</Text>
          </div>

          <div>
            <Group gap="xs" mb="xs">
              <IconCurrencyDollar size={16} color="var(--mantine-color-teal-6)" />
              <Text size="sm" c="dimmed">Donations Today</Text>
            </Group>
            <Text size="xl" fw={700}>{data.liveMetrics.donations}</Text>
          </div>
        </SimpleGrid>
      </Card>

      {/* Recent Activity Feed */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Recent Activity</Title>
        
        <ScrollArea h={300}>
          <Timeline active={-1} bulletSize={24} lineWidth={2}>
            {data.recentActions.map((action, index) => (
              <Timeline.Item
                key={index}
                bullet={getActionIcon(action.action)}
                title={
                  <Group gap="xs">
                    <Text size="sm" fw={500}>{action.action}</Text>
                    <Badge 
                      size="xs" 
                      variant="light" 
                      color={getActionColor(action.action)}
                    >
                      {formatTimeAgo(action.timestamp)}
                    </Badge>
                  </Group>
                }
              >
                <Text size="xs" c="dimmed">
                  {action.user ? `by ${action.user}` : 'Anonymous user'}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </ScrollArea>
      </Card>

      {/* Active Users Chart Placeholder */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Active Users (Last Hour)</Title>
        <div style={{ 
          height: 200, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'var(--mantine-color-gray-0)',
          borderRadius: 'var(--mantine-radius-md)',
          border: '1px dashed var(--mantine-color-gray-4)'
        }}>
          <Text c="dimmed" ta="center">
            Real-time user activity chart<br />
            <Text size="xs">Updates every 5 seconds when live</Text>
          </Text>
        </div>
      </Card>

      {/* System Status */}
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">System Status</Title>
        
        <Group justify="space-between" mb="md">
          <Text size="sm">API Response Time</Text>
          <Badge variant="light" color="green">
            ~200ms
          </Badge>
        </Group>
        
        <Group justify="space-between" mb="md">
          <Text size="sm">Database Status</Text>
          <Badge variant="light" color="green">
            Healthy
          </Badge>
        </Group>
        
        <Group justify="space-between" mb="md">
          <Text size="sm">Cache Hit Rate</Text>
          <Badge variant="light" color="blue">
            94.2%
          </Badge>
        </Group>
        
        <Group justify="space-between">
          <Text size="sm">Last Updated</Text>
          <Text size="sm" c="dimmed">
            {new Date().toLocaleTimeString()}
          </Text>
        </Group>
      </Card>
    </SimpleGrid>
  );
}