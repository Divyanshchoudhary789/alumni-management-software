import { SimpleGrid, Stack, Skeleton, Card, Title, Text } from '@mantine/core';

interface ChartsGridProps {
  loading?: boolean;
}

export function ChartsGrid({ loading = false }: ChartsGridProps) {
  if (loading) {
    return (
      <Stack gap="lg">
        {/* Top row - Main trend charts */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Skeleton height={350} radius="md" />
          <Skeleton height={350} radius="md" />
        </SimpleGrid>

        {/* Bottom row - Activity and event charts */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Skeleton height={350} radius="md" />
          <Skeleton height={350} radius="md" />
        </SimpleGrid>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Top row - Main trend charts */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Card withBorder radius="md" p="lg">
          <Title order={3}>Alumni Growth</Title>
          <Text c="dimmed" mt="md">Chart temporarily disabled</Text>
        </Card>
        <Card withBorder radius="md" p="lg">
          <Title order={3}>Donation Trends</Title>
          <Text c="dimmed" mt="md">Chart temporarily disabled</Text>
        </Card>
      </SimpleGrid>

      {/* Bottom row - Activity and event charts */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Card withBorder radius="md" p="lg">
          <Title order={3}>Event Attendance</Title>
          <Text c="dimmed" mt="md">Chart temporarily disabled</Text>
        </Card>
        <Card withBorder radius="md" p="lg">
          <Title order={3}>Member Activity</Title>
          <Text c="dimmed" mt="md">Chart temporarily disabled</Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
