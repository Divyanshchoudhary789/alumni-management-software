'use client';

import {
  Card,
  Title,
  Table,
  Text,
  Badge,
  Group,
  Avatar,
  Button,
  Skeleton,
  Stack,
} from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { mockData } from '@/lib/mock-data';

interface RecentDonationsProps {
  donations: any[];
  loading: boolean;
}

export function RecentDonations({ donations, loading }: RecentDonationsProps) {
  if (loading) {
    return (
      <Card padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Recent Donations
        </Title>
        <Stack gap="sm">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} height={60} />
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
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getDonorInfo = (donorId: string) => {
    const donor = mockData.alumni.find(a => a.id === donorId);
    return donor
      ? {
          name: `${donor.firstName} ${donor.lastName}`,
          avatar: donor.profileImage,
          company: donor.currentCompany,
        }
      : {
          name: 'Anonymous Donor',
          avatar: null,
          company: null,
        };
  };

  return (
    <Card padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Recent Donations</Title>
        <Button
          variant="light"
          size="xs"
          rightSection={<IconExternalLink size={14} />}
        >
          View All
        </Button>
      </Group>

      {donations.length > 0 ? (
        <Table.ScrollContainer minWidth={600}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Donor</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Purpose</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {donations.map(donation => {
                const donorInfo = getDonorInfo(donation.donorId);

                return (
                  <Table.Tr key={donation.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar src={donorInfo.avatar} size="sm" radius="xl">
                          {donorInfo.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={500}>
                            {donorInfo.name}
                          </Text>
                          {donorInfo.company && (
                            <Text size="xs" c="dimmed">
                              {donorInfo.company}
                            </Text>
                          )}
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} c="green">
                        {formatCurrency(donation.amount)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{donation.purpose}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(donation.donationDate).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getStatusColor(donation.status)}
                        variant="light"
                        size="sm"
                      >
                        {donation.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Text c="dimmed" ta="center" py="xl">
          No recent donations
        </Text>
      )}
    </Card>
  );
}
