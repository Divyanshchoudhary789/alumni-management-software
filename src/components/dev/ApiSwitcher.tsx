'use client';

import { useState, useEffect } from 'react';
import { Card, Switch, Text, Group, Badge, Button, Stack } from '@mantine/core';
import { IconApi, IconDatabase, IconRefresh } from '@tabler/icons-react';
import { apiClientInstance } from '@/lib/apiClient';
import { notifications } from '@mantine/notifications';

export function ApiSwitcher() {
  const [isUsingRealApi, setIsUsingRealApi] = useState(false);
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setIsUsingRealApi(apiClientInstance.isUsingRealApi);
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setChecking(true);
    try {
      const isHealthy = await apiClientInstance.checkBackendHealth();
      setBackendHealth(isHealthy);
    } catch (error) {
      setBackendHealth(false);
    } finally {
      setChecking(false);
    }
  };

  const handleApiSwitch = (useReal: boolean) => {
    apiClientInstance.setApiMode(useReal);
    setIsUsingRealApi(useReal);

    notifications.show({
      title: 'API Mode Changed',
      message: `Switched to ${useReal ? 'real' : 'mock'} API services`,
      color: useReal ? 'blue' : 'orange',
    });
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <Card withBorder shadow="sm" radius="md" p="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconApi size={20} />
            <Text fw={500}>API Configuration</Text>
          </Group>
          <Badge color={isUsingRealApi ? 'blue' : 'orange'} variant="light">
            {isUsingRealApi ? 'Real API' : 'Mock API'}
          </Badge>
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <IconDatabase size={16} />
            <Text size="sm">Backend Status:</Text>
            <Badge
              color={
                backendHealth === null
                  ? 'gray'
                  : backendHealth
                    ? 'green'
                    : 'red'
              }
              size="sm"
            >
              {backendHealth === null
                ? 'Unknown'
                : backendHealth
                  ? 'Healthy'
                  : 'Unavailable'}
            </Badge>
          </Group>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            loading={checking}
            onClick={checkBackendHealth}
          >
            Check
          </Button>
        </Group>

        <Switch
          label="Use Real API Services"
          description="Toggle between mock and real backend API services"
          checked={isUsingRealApi}
          onChange={event => handleApiSwitch(event.currentTarget.checked)}
          disabled={!backendHealth && isUsingRealApi}
        />

        <Text size="xs" c="dimmed">
          {isUsingRealApi
            ? 'Using real backend API services. Data changes will persist.'
            : 'Using mock services. Data changes are temporary and reset on page reload.'}
        </Text>
      </Stack>
    </Card>
  );
}
