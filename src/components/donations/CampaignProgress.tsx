'use client';

import {
  Card,
  Title,
  Stack,
  Text,
  Progress,
  Group,
  Badge,
  Button,
  Skeleton,
} from '@mantine/core';
import { IconTarget, IconCalendar, IconTrendingUp } from '@tabler/icons-react';

interface CampaignProgressProps {
  campaigns: any[];
  loading: boolean;
}

export function CampaignProgress({
  campaigns,
  loading,
}: CampaignProgressProps) {
  if (loading) {
    return (
      <Card padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Campaign Progress
        </Title>
        <Stack gap="md">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} height={80} />
          ))}
        </Stack>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'paused':
        return 'yellow';
      case 'ended':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Campaign Progress</Title>
        <Button variant="light" size="xs">
          View All
        </Button>
      </Group>

      <Stack gap="lg">
        {campaigns.slice(0, 3).map(campaign => {
          const progressPercentage = (campaign.raised / campaign.goal) * 100;
          const daysRemaining = getDaysRemaining(campaign.endDate);

          return (
            <Card key={campaign.id} padding="md" radius="sm" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="sm" lineClamp={1}>
                  {campaign.name}
                </Text>
                <Badge
                  color={getStatusColor(campaign.status)}
                  size="xs"
                  variant="light"
                >
                  {campaign.status}
                </Badge>
              </Group>

              <Text size="xs" c="dimmed" mb="sm" lineClamp={2}>
                {campaign.description}
              </Text>

              <Progress
                value={progressPercentage}
                size="lg"
                radius="sm"
                mb="xs"
                color={
                  progressPercentage >= 100
                    ? 'green'
                    : progressPercentage >= 75
                      ? 'blue'
                      : 'orange'
                }
              />

              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  {formatCurrency(campaign.raised)}
                </Text>
                <Text size="sm" c="dimmed">
                  of {formatCurrency(campaign.goal)}
                </Text>
              </Group>

              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <IconTarget size={14} />
                  <Text size="xs" c="dimmed">
                    {progressPercentage.toFixed(1)}% complete
                  </Text>
                </Group>

                {daysRemaining > 0 ? (
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text size="xs" c="dimmed">
                      {daysRemaining} days left
                    </Text>
                  </Group>
                ) : (
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text size="xs" c="red">
                      Ended
                    </Text>
                  </Group>
                )}
              </Group>

              {progressPercentage >= 90 && (
                <Group gap="xs" mt="xs">
                  <IconTrendingUp size={14} color="green" />
                  <Text size="xs" c="green" fw={500}>
                    Nearly reached goal!
                  </Text>
                </Group>
              )}
            </Card>
          );
        })}
      </Stack>

      {campaigns.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          No active campaigns
        </Text>
      )}
    </Card>
  );
}
