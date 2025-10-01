'use client';

import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Button,
  Group,
  Badge,
  Alert,
  Loader,
  Code,
  Divider,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconRefresh,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useApi, useMutation } from '@/hooks/useApi';
import { alumniApiService } from '@/services/api/alumniService';
import {
  checkBackendHealth,
  dashboardApiService,
  eventsApiService,
  authApiService,
} from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function TestApiPage() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Health check
  const {
    data: healthStatus,
    loading: healthLoading,
    refetch: checkHealth,
  } = useApi(() => checkBackendHealth(), {
    onSuccess: isHealthy => {
      setTestResults(prev => ({ ...prev, health: isHealthy }));
    },
    onError: () => {
      setTestResults(prev => ({ ...prev, health: false }));
    },
  });

  // Dashboard metrics test
  const { mutate: testDashboard, loading: dashboardLoading } = useMutation(
    () => dashboardApiService.getDashboardMetrics(),
    {
      onSuccess: data => {
        setTestResults(prev => ({
          ...prev,
          dashboard: { success: true, data },
        }));
      },
      onError: error => {
        setTestResults(prev => ({
          ...prev,
          dashboard: { success: false, error: error.message },
        }));
      },
    }
  );

  // Alumni API test
  const { mutate: testAlumni, loading: alumniLoading } = useMutation(
    () => alumniApiService.getAlumni({ limit: 5 }),
    {
      onSuccess: data => {
        setTestResults(prev => ({ ...prev, alumni: { success: true, data } }));
      },
      onError: error => {
        setTestResults(prev => ({
          ...prev,
          alumni: { success: false, error: error.message },
        }));
      },
    }
  );

  // Events API test
  const { mutate: testEvents, loading: eventsLoading } = useMutation(
    () => eventsApiService.getEvents({ limit: 5 }),
    {
      onSuccess: data => {
        setTestResults(prev => ({ ...prev, events: { success: true, data } }));
      },
      onError: error => {
        setTestResults(prev => ({
          ...prev,
          events: { success: false, error: error.message },
        }));
      },
    }
  );

  // Auth API test
  const { mutate: testAuth, loading: authLoading } = useMutation(
    () => authApiService.getCurrentUser(),
    {
      onSuccess: data => {
        setTestResults(prev => ({ ...prev, auth: { success: true, data } }));
      },
      onError: error => {
        setTestResults(prev => ({
          ...prev,
          auth: { success: false, error: error.message },
        }));
      },
    }
  );

  const runAllTests = () => {
    setTestResults({});
    checkHealth();
    testDashboard();
    testAlumni();
    testEvents();
    if (isAuthenticated) {
      testAuth();
    }
  };

  const renderTestResult = (
    testName: string,
    result: any,
    loading: boolean
  ) => {
    if (loading) {
      return (
        <Group gap="xs">
          <Loader size="sm" />
          <Text size="sm">Testing...</Text>
        </Group>
      );
    }

    if (!result) {
      return (
        <Badge color="gray" variant="light">
          Not tested
        </Badge>
      );
    }

    if (result === true || result.success) {
      return (
        <Group gap="xs">
          <IconCheck size={16} color="green" />
          <Badge color="green" variant="light">
            Success
          </Badge>
        </Group>
      );
    }

    return (
      <Group gap="xs">
        <IconX size={16} color="red" />
        <Badge color="red" variant="light">
          Failed
        </Badge>
      </Group>
    );
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>API Connection Test</Title>
          <Text c="dimmed">
            Test the connection between frontend and backend services
          </Text>
        </div>

        {!isAuthenticated && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow">
            You are not authenticated. Some API tests may fail.
          </Alert>
        )}

        <Card withBorder p="lg">
          <Group justify="space-between" mb="md">
            <Title order={3}>Connection Status</Title>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={runAllTests}
              loading={
                healthLoading ||
                dashboardLoading ||
                alumniLoading ||
                eventsLoading ||
                authLoading
              }
            >
              Run All Tests
            </Button>
          </Group>

          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Backend Health Check</Text>
              {renderTestResult('health', testResults.health, healthLoading)}
            </Group>

            <Divider />

            <Group justify="space-between">
              <Text fw={500}>Dashboard API</Text>
              {renderTestResult(
                'dashboard',
                testResults.dashboard,
                dashboardLoading
              )}
            </Group>

            <Group justify="space-between">
              <Text fw={500}>Alumni API</Text>
              {renderTestResult('alumni', testResults.alumni, alumniLoading)}
            </Group>

            <Group justify="space-between">
              <Text fw={500}>Events API</Text>
              {renderTestResult('events', testResults.events, eventsLoading)}
            </Group>

            {isAuthenticated && (
              <Group justify="space-between">
                <Text fw={500}>Auth API</Text>
                {renderTestResult('auth', testResults.auth, authLoading)}
              </Group>
            )}
          </Stack>
        </Card>

        {/* Display test results */}
        {Object.keys(testResults).length > 0 && (
          <Card withBorder p="lg">
            <Title order={3} mb="md">
              Test Results
            </Title>
            <Stack gap="md">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key}>
                  <Text fw={500} mb="xs" tt="capitalize">
                    {key} API
                  </Text>
                  <Code block>{JSON.stringify(result, null, 2)}</Code>
                </div>
              ))}
            </Stack>
          </Card>
        )}

        {/* User info */}
        {user && (
          <Card withBorder p="lg">
            <Title order={3} mb="md">
              Current User
            </Title>
            <Code block>
              {JSON.stringify(
                {
                  id: user.id,
                  email: user.primaryEmailAddress?.emailAddress,
                  role: user.role,
                  firstName: user.firstName,
                  lastName: user.lastName,
                },
                null,
                2
              )}
            </Code>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
