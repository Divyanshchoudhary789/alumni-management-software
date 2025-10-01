import { Card, Group, Text, Avatar, ThemeIcon, Stack } from '@mantine/core';
import {
  IconUserPlus,
  IconCurrencyDollar,
  IconCalendarEvent,
  IconUsers,
  IconMail,
  IconEdit,
  IconUsersGroup,
} from '@tabler/icons-react';
import { RecentActivity } from '@/types';
import classes from './ActivityCard.module.css';

interface ActivityCardProps {
  activity: RecentActivity;
}

const getActivityIcon = (type: RecentActivity['type']) => {
  const iconProps = { size: 16 };

  switch (type) {
    case 'new_alumni':
      return <IconUserPlus {...iconProps} />;
    case 'donation':
      return <IconCurrencyDollar {...iconProps} />;
    case 'event_created':
      return <IconCalendarEvent {...iconProps} />;
    case 'event_registration':
      return <IconUsers {...iconProps} />;
    case 'communication_sent':
      return <IconMail {...iconProps} />;
    case 'profile_update':
      return <IconEdit {...iconProps} />;
    case 'mentorship':
      return <IconUsersGroup {...iconProps} />;
    default:
      return <IconUsers {...iconProps} />;
  }
};

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'new_alumni':
      return 'blue';
    case 'donation':
      return 'green';
    case 'event_created':
      return 'orange';
    case 'event_registration':
      return 'purple';
    case 'communication_sent':
      return 'cyan';
    case 'profile_update':
      return 'gray';
    case 'mentorship':
      return 'teal';
    default:
      return 'blue';
  }
};

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - timestamp.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const color = getActivityColor(activity.type);

  return (
    <Card withBorder={false} radius="sm" className={classes.card} p="md">
      <Group gap="md" align="flex-start">
        <ThemeIcon
          size="md"
          radius="xl"
          variant="light"
          color={color}
          className={classes.icon}
        >
          {getActivityIcon(activity.type)}
        </ThemeIcon>

        <Stack gap={4} style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start">
            <Text size="sm" fw={500} className={classes.title}>
              {activity.title}
            </Text>
            <Text size="xs" c="dimmed" className={classes.time}>
              {formatTimeAgo(activity.timestamp)}
            </Text>
          </Group>

          <Text size="sm" c="dimmed" className={classes.description}>
            {activity.description}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
