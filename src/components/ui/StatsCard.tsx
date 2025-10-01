import { Card, Text, Group, Stack, ThemeIcon, Progress } from '@mantine/core';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from '@tabler/icons-react';
import classes from './StatsCard.module.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  showProgress?: boolean;
  progressValue?: number;
  progressColor?: string;
}

export function StatsCard({
  title,
  value,
  trend,
  description,
  icon,
  color = 'blue',
  loading = false,
  showProgress = false,
  progressValue,
  progressColor,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;

    if (trend > 0) {
      return <IconTrendingUp size={16} className={classes.trendUp} />;
    } else if (trend < 0) {
      return <IconTrendingDown size={16} className={classes.trendDown} />;
    } else {
      return <IconMinus size={16} className={classes.trendNeutral} />;
    }
  };

  const getTrendColor = () => {
    if (trend === undefined) return 'dimmed';
    return trend > 0 ? 'teal' : trend < 0 ? 'red' : 'dimmed';
  };

  const formatTrend = () => {
    if (trend === undefined) return '';
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <Card
      withBorder
      radius="md"
      className={classes.card}
      style={
        {
          '--card-color': `var(--mantine-color-${color}-6)`,
        } as React.CSSProperties
      }
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap={4} style={{ flex: 1 }}>
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="xl" fw={700} className={classes.value}>
            {loading ? '...' : value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
          {trend !== undefined && (
            <Group gap={4} align="center">
              {getTrendIcon()}
              <Text size="sm" c={getTrendColor()} fw={500}>
                {formatTrend()}
              </Text>
              <Text size="sm" c="dimmed">
                vs last month
              </Text>
            </Group>
          )}
          {showProgress && progressValue !== undefined && (
            <Progress
              value={progressValue}
              color={progressColor || color}
              size="sm"
              radius="xl"
              mt="xs"
            />
          )}
        </Stack>
        {icon && (
          <ThemeIcon
            size="lg"
            radius="md"
            variant="light"
            color={color}
            className={classes.icon}
          >
            {icon}
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}
