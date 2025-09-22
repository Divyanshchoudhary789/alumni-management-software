'use client';

import { Badge } from '@mantine/core';
import { Event } from '@/types';

interface EventStatusBadgeProps {
  status: Event['status'];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function EventStatusBadge({ status, size = 'sm' }: EventStatusBadgeProps) {
  const getStatusConfig = (status: Event['status']) => {
    switch (status) {
      case 'published':
        return { color: 'green', label: 'Published' };
      case 'draft':
        return { color: 'gray', label: 'Draft' };
      case 'cancelled':
        return { color: 'red', label: 'Cancelled' };
      case 'completed':
        return { color: 'blue', label: 'Completed' };
      default:
        return { color: 'gray', label: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge color={config.color} size={size} variant="light">
      {config.label}
    </Badge>
  );
}