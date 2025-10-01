'use client';

import { Container, Stack, Skeleton, Paper, Group, Box } from '@mantine/core';

export function AuthLoading() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header skeleton */}
        <Group justify="space-between">
          <Skeleton height={32} width={200} />
          <Group gap="sm">
            <Skeleton height={32} width={32} radius="xl" />
            <Box>
              <Skeleton height={16} width={120} mb={4} />
              <Skeleton height={12} width={160} />
            </Box>
          </Group>
        </Group>

        {/* Content skeleton */}
        <Paper shadow="sm" p="xl" radius="md">
          <Stack gap="md">
            <Skeleton height={24} width={300} />
            <Group gap="md">
              <Skeleton height={80} width={120} />
              <Skeleton height={80} width={120} />
              <Skeleton height={80} width={120} />
              <Skeleton height={80} width={120} />
            </Group>
            <Skeleton height={200} />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

export default AuthLoading;
