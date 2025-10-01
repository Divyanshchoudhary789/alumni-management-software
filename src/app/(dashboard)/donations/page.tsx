'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconRefresh, IconDownload, IconPlus } from '@tabler/icons-react';
import { mockDonationService } from '@/lib/mock-services';
import { DonationMetrics } from '@/components/donations/DonationMetrics';
import { DonationCharts } from '@/components/donations/DonationCharts';
import { RecentDonations } from '@/components/donations/RecentDonations';
import { CampaignProgress } from '@/components/donations/CampaignProgress';
import { DonorRecognition } from '@/components/donations/DonorRecognition';
import { DonationManagement } from '@/components/donations/DonationManagement';
import { notifications } from '@mantine/notifications';

export default function DonationsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, campaignsResponse, recentResponse] =
        await Promise.all([
          mockDonationService.getDonationStats(),
          mockDonationService.getCampaigns(),
          mockDonationService.getRecentDonations(10),
        ]);

      setStats(statsResponse.data);
      setCampaigns(campaignsResponse.data);
      setRecentDonations(recentResponse.data);
    } catch (error) {
      console.error('Error loading donation data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load donation data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
    notifications.show({
      title: 'Data Refreshed',
      message: 'Donation data has been updated',
      color: 'green',
    });
  };

  const handleExport = () => {
    // Mock export functionality
    notifications.show({
      title: 'Export Started',
      message: 'Donation report is being generated...',
      color: 'blue',
    });
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Donation Management</Title>
          <Text c="dimmed" size="sm">
            Track donations, manage campaigns, and recognize donors
          </Text>
        </div>
        <Group>
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={handleRefresh}
              loading={loading}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Export report">
            <ActionIcon variant="light" size="lg" onClick={handleExport}>
              <IconDownload size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Key Metrics */}
      <DonationMetrics stats={stats} loading={loading} />

      <Grid mt="xl">
        {/* Charts Section */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <DonationCharts stats={stats} loading={loading} />
        </Grid.Col>

        {/* Campaign Progress */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <CampaignProgress campaigns={campaigns} loading={loading} />
        </Grid.Col>

        {/* Recent Donations */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <RecentDonations donations={recentDonations} loading={loading} />
        </Grid.Col>

        {/* Donor Recognition */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <DonorRecognition stats={stats} loading={loading} />
        </Grid.Col>

        {/* Donation Management */}
        <Grid.Col span={12}>
          <DonationManagement showAddButton={true} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
