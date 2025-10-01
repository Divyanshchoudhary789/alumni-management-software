'use client';

import {
  Card,
  Title,
  Stack,
  Text,
  Group,
  Avatar,
  Badge,
  Button,
  Skeleton,
  ThemeIcon,
} from '@mantine/core';
import {
  IconTrophy,
  IconMedal,
  IconAward,
  IconStar,
} from '@tabler/icons-react';
import { mockData } from '@/lib/mock-data';

interface DonorRecognitionProps {
  stats: any;
  loading: boolean;
}

export function DonorRecognition({ stats, loading }: DonorRecognitionProps) {
  if (loading) {
    return (
      <Card padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Top Donors
        </Title>
        <Stack gap="md">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} height={60} />
          ))}
        </Stack>
      </Card>
    );
  }

  if (!stats?.topDonors) {
    return (
      <Card padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Top Donors
        </Title>
        <Text c="dimmed" ta="center" py="xl">
          No donor data available
        </Text>
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

  const getDonorInfo = (donorId: string) => {
    const donor = mockData.alumni.find(a => a.id === donorId);
    return donor
      ? {
          name: `${donor.firstName} ${donor.lastName}`,
          avatar: donor.profileImage,
          company: donor.currentCompany,
          graduationYear: donor.graduationYear,
        }
      : {
          name: 'Anonymous Donor',
          avatar: null,
          company: null,
          graduationYear: null,
        };
  };

  const getRecognitionLevel = (amount: number, rank: number) => {
    if (rank === 0)
      return { level: 'Platinum', color: 'violet', icon: IconTrophy };
    if (rank === 1) return { level: 'Gold', color: 'yellow', icon: IconMedal };
    if (rank === 2) return { level: 'Silver', color: 'gray', icon: IconAward };
    if (amount >= 5000)
      return { level: 'Bronze', color: 'orange', icon: IconStar };
    if (amount >= 1000)
      return { level: 'Supporter', color: 'blue', icon: IconStar };
    return { level: 'Friend', color: 'green', icon: IconStar };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <IconTrophy size={16} color="gold" />;
      case 1:
        return <IconMedal size={16} color="silver" />;
      case 2:
        return <IconAward size={16} color="#CD7F32" />;
      default:
        return (
          <Text size="sm" fw={500} c="dimmed">
            #{rank + 1}
          </Text>
        );
    }
  };

  return (
    <Card padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Top Donors</Title>
        <Button variant="light" size="xs">
          Recognition Wall
        </Button>
      </Group>

      <Stack gap="md">
        {stats.topDonors.slice(0, 10).map((donor: any, index: number) => {
          const donorInfo = getDonorInfo(donor.donorId);
          const recognition = getRecognitionLevel(donor.totalAmount, index);
          const IconComponent = recognition.icon;

          return (
            <Group key={donor.donorId} justify="space-between" wrap="nowrap">
              <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 24,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {getRankIcon(index)}
                </div>

                <Avatar src={donorInfo.avatar} size="sm" radius="xl">
                  {donorInfo.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </Avatar>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {donorInfo.name}
                  </Text>
                  <Group gap="xs">
                    {donorInfo.company && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {donorInfo.company}
                      </Text>
                    )}
                    {donorInfo.graduationYear && (
                      <Text size="xs" c="dimmed">
                        '{donorInfo.graduationYear.toString().slice(-2)}
                      </Text>
                    )}
                  </Group>
                </div>
              </Group>

              <div style={{ textAlign: 'right' }}>
                <Text size="sm" fw={500} c="green">
                  {formatCurrency(donor.totalAmount)}
                </Text>
                <Group gap="xs" justify="flex-end">
                  <Badge
                    color={recognition.color}
                    variant="light"
                    size="xs"
                    leftSection={<IconComponent size={10} />}
                  >
                    {recognition.level}
                  </Badge>
                </Group>
              </div>
            </Group>
          );
        })}
      </Stack>

      {/* Recognition Summary */}
      <Card mt="md" padding="sm" radius="sm" bg="gray.0">
        <Text size="xs" c="dimmed" mb="xs">
          Recognition Levels
        </Text>
        <Group gap="xs" wrap="wrap">
          <Badge color="violet" variant="light" size="xs">
            Platinum $10k+
          </Badge>
          <Badge color="yellow" variant="light" size="xs">
            Gold $5k+
          </Badge>
          <Badge color="gray" variant="light" size="xs">
            Silver $2.5k+
          </Badge>
          <Badge color="orange" variant="light" size="xs">
            Bronze $1k+
          </Badge>
        </Group>
      </Card>
    </Card>
  );
}
