'use client';

import { Container, Title, Text, Stack } from '@mantine/core';
import { DonationManagement } from '@/components/donations/DonationManagement';

export default function DonationManagePage() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <div>
          <Title order={1}>Donation Records</Title>
          <Text c="dimmed" size="sm">
            View, edit, and manage all donation records and transactions
          </Text>
        </div>

        <DonationManagement />
      </Stack>
    </Container>
  );
}
