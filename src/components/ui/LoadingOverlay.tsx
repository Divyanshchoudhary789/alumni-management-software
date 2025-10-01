'use client';

import { Overlay, Center, Loader, Text, Stack } from '@mantine/core';
import { useNavigationStore } from '@/stores/navigationStore';

export function LoadingOverlay() {
  const { isNavigating } = useNavigationStore();

  if (!isNavigating) return null;

  return (
    <Overlay color="#000" backgroundOpacity={0.35} blur={2}>
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="white">
            Loading...
          </Text>
        </Stack>
      </Center>
    </Overlay>
  );
}
