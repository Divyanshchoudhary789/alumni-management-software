'use client';

import { Container, Title, Text, Stack } from '@mantine/core';
import { CampaignManagement } from '@/components/donations/CampaignManagement';

export default function CampaignsPage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={1}>Campaign Management</Title>
          <Text c="dimmed" size="sm">
            Create and manage fundraising campaigns to organize donation efforts
          </Text>
        </div>

        <CampaignManagement />
      </Stack>
    </Container>
  );
}