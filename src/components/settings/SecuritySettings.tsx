'use client';

import { useState } from 'react';
import {
  Stack,
  Grid,
  TextInput,
  Button,
  Group,
  Title,
  Text,
  Card,
  Switch,
  Select,
  NumberInput,
  Alert,
  Badge,
  Table,
  ActionIcon,
  Modal,
  LoadingOverlay,
  Divider,
  Progress,
  List,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconAlertCircle,
  IconShield,
  IconLock,
  IconKey,
  IconEye,
  IconTrash,
  IconRefresh,
  IconAlertTriangle,
  IconCircleCheck,
  IconX,
} from '@tabler/icons-react';
import { settingsService } from '@/lib/mock-services/settingsService';

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number; // days
  };
  sessionSettings: {
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauthentication: boolean;
  };
  twoFactorAuth: {
    enabled: boolean;
    enforceForAdmins: boolean;
    allowedMethods: string[];
  };
  loginSecurity: {
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    enableCaptcha: boolean;
    allowedIpRanges: string[];
  };
  auditSettings: {
    enableAuditLog: boolean;
    retentionPeriod: number; // days
    logFailedLogins: boolean;
    logDataChanges: boolean;
  };
}

interface SecurityEvent {
  id: string;
  type:
    | 'login_failed'
    | 'login_success'
    | 'password_change'
    | 'permission_change'
    | 'data_export';
  userId: string;
  userEmail: string;
  ipAddress: string;
  timestamp: Date;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [auditEvents, setAuditEvents] = useState<SecurityEvent[]>([]);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm<SecuritySettings>({
    initialValues: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        passwordExpiry: 90,
      },
      sessionSettings: {
        sessionTimeout: 60,
        maxConcurrentSessions: 3,
        requireReauthentication: false,
      },
      twoFactorAuth: {
        enabled: false,
        enforceForAdmins: true,
        allowedMethods: ['totp', 'sms'],
      },
      loginSecurity: {
        maxFailedAttempts: 5,
        lockoutDuration: 15,
        enableCaptcha: true,
        allowedIpRanges: [],
      },
      auditSettings: {
        enableAuditLog: true,
        retentionPeriod: 365,
        logFailedLogins: true,
        logDataChanges: true,
      },
    },
  });

  const handleSubmit = async (values: SecuritySettings) => {
    setLoading(true);
    try {
      await settingsService.updateSecuritySettings(values);
      notifications.show({
        title: 'Security Settings Updated',
        message: 'Security configuration has been saved successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update security settings',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = () => {
    let score = 0;
    const policy = form.values.passwordPolicy;

    if (policy.minLength >= 8) score += 20;
    if (policy.requireUppercase) score += 20;
    if (policy.requireLowercase) score += 20;
    if (policy.requireNumbers) score += 20;
    if (policy.requireSpecialChars) score += 20;

    return score;
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const mockAuditEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'login_failed',
      userId: 'user123',
      userEmail: 'john.doe@example.com',
      ipAddress: '192.168.1.100',
      timestamp: new Date('2024-01-15T10:30:00'),
      details: 'Invalid password attempt',
      severity: 'medium',
    },
    {
      id: '2',
      type: 'login_success',
      userId: 'admin456',
      userEmail: 'admin@university.edu',
      ipAddress: '10.0.0.50',
      timestamp: new Date('2024-01-15T09:15:00'),
      details: 'Successful admin login',
      severity: 'low',
    },
    {
      id: '3',
      type: 'permission_change',
      userId: 'admin456',
      userEmail: 'admin@university.edu',
      ipAddress: '10.0.0.50',
      timestamp: new Date('2024-01-14T16:45:00'),
      details: 'Updated user permissions for john.doe@example.com',
      severity: 'high',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const passwordStrength = calculatePasswordStrength();

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg" pos="relative">
        <LoadingOverlay visible={loading} />

        {/* Password Policy */}
        <Card withBorder>
          <Title order={3} mb="md">
            Password Policy
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Minimum Password Length"
                min={6}
                max={32}
                {...form.getInputProps('passwordPolicy.minLength')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Password Expiry (days)"
                min={0}
                max={365}
                description="0 = never expires"
                {...form.getInputProps('passwordPolicy.passwordExpiry')}
              />
            </Grid.Col>
          </Grid>

          <Stack gap="sm" mt="md">
            <Text size="sm" fw={500}>
              Password Requirements
            </Text>
            <Switch
              label="Require uppercase letters (A-Z)"
              {...form.getInputProps('passwordPolicy.requireUppercase', {
                type: 'checkbox',
              })}
            />
            <Switch
              label="Require lowercase letters (a-z)"
              {...form.getInputProps('passwordPolicy.requireLowercase', {
                type: 'checkbox',
              })}
            />
            <Switch
              label="Require numbers (0-9)"
              {...form.getInputProps('passwordPolicy.requireNumbers', {
                type: 'checkbox',
              })}
            />
            <Switch
              label="Require special characters (!@#$%^&*)"
              {...form.getInputProps('passwordPolicy.requireSpecialChars', {
                type: 'checkbox',
              })}
            />
          </Stack>

          <Alert mt="md" color={getPasswordStrengthColor(passwordStrength)}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Password Policy Strength
              </Text>
              <Text size="sm">{passwordStrength}%</Text>
            </Group>
            <Progress
              value={passwordStrength}
              color={getPasswordStrengthColor(passwordStrength)}
            />
          </Alert>
        </Card>

        {/* Session Management */}
        <Card withBorder>
          <Title order={3} mb="md">
            Session Management
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Session Timeout (minutes)"
                min={5}
                max={480}
                {...form.getInputProps('sessionSettings.sessionTimeout')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Max Concurrent Sessions"
                min={1}
                max={10}
                {...form.getInputProps('sessionSettings.maxConcurrentSessions')}
              />
            </Grid.Col>
          </Grid>
          <Switch
            label="Require re-authentication for sensitive actions"
            mt="md"
            {...form.getInputProps('sessionSettings.requireReauthentication', {
              type: 'checkbox',
            })}
          />
        </Card>

        {/* Two-Factor Authentication */}
        <Card withBorder>
          <Title order={3} mb="md">
            Two-Factor Authentication
          </Title>
          <Stack gap="md">
            <Switch
              label="Enable Two-Factor Authentication"
              description="Allow users to enable 2FA for their accounts"
              {...form.getInputProps('twoFactorAuth.enabled', {
                type: 'checkbox',
              })}
            />
            {form.values.twoFactorAuth.enabled && (
              <>
                <Switch
                  label="Enforce 2FA for Administrators"
                  description="Require all admin users to use 2FA"
                  {...form.getInputProps('twoFactorAuth.enforceForAdmins', {
                    type: 'checkbox',
                  })}
                />
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Allowed 2FA Methods
                  </Text>
                  <List spacing="xs" size="sm">
                    <List.Item
                      icon={
                        <ThemeIcon color="blue" size={16} radius="xl">
                          <IconCircleCheck size={12} />
                        </ThemeIcon>
                      }
                    >
                      TOTP (Time-based One-Time Password) - Google
                      Authenticator, Authy
                    </List.Item>
                    <List.Item
                      icon={
                        <ThemeIcon color="blue" size={16} radius="xl">
                          <IconCircleCheck size={12} />
                        </ThemeIcon>
                      }
                    >
                      SMS (Text Message) - Phone number verification
                    </List.Item>
                  </List>
                </div>
              </>
            )}
          </Stack>
        </Card>

        {/* Login Security */}
        <Card withBorder>
          <Title order={3} mb="md">
            Login Security
          </Title>
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Max Failed Login Attempts"
                min={3}
                max={10}
                {...form.getInputProps('loginSecurity.maxFailedAttempts')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Account Lockout Duration (minutes)"
                min={5}
                max={1440}
                {...form.getInputProps('loginSecurity.lockoutDuration')}
              />
            </Grid.Col>
          </Grid>
          <Switch
            label="Enable CAPTCHA for login attempts"
            description="Show CAPTCHA after failed login attempts"
            mt="md"
            {...form.getInputProps('loginSecurity.enableCaptcha', {
              type: 'checkbox',
            })}
          />
        </Card>

        {/* Audit & Logging */}
        <Card withBorder>
          <Title order={3} mb="md">
            Audit & Logging
          </Title>
          <Stack gap="md">
            <Switch
              label="Enable Audit Logging"
              description="Log security events and user actions"
              {...form.getInputProps('auditSettings.enableAuditLog', {
                type: 'checkbox',
              })}
            />
            {form.values.auditSettings.enableAuditLog && (
              <>
                <NumberInput
                  label="Log Retention Period (days)"
                  min={30}
                  max={2555}
                  description="How long to keep audit logs"
                  {...form.getInputProps('auditSettings.retentionPeriod')}
                />
                <Switch
                  label="Log Failed Login Attempts"
                  {...form.getInputProps('auditSettings.logFailedLogins', {
                    type: 'checkbox',
                  })}
                />
                <Switch
                  label="Log Data Changes"
                  description="Log when users modify data"
                  {...form.getInputProps('auditSettings.logDataChanges', {
                    type: 'checkbox',
                  })}
                />
              </>
            )}
          </Stack>
        </Card>

        {/* Security Events */}
        {form.values.auditSettings.enableAuditLog && (
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>Recent Security Events</Title>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconEye size={16} />}
                onClick={open}
              >
                View All Events
              </Button>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>IP Address</Table.Th>
                  <Table.Th>Time</Table.Th>
                  <Table.Th>Severity</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockAuditEvents.slice(0, 5).map(event => (
                  <Table.Tr key={event.id}>
                    <Table.Td>
                      <Text size="sm">{event.details}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{event.userEmail}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {event.ipAddress}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {event.timestamp.toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={getSeverityColor(event.severity)}
                        variant="light"
                      >
                        {event.severity}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        <Divider />

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            Save Security Settings
          </Button>
        </Group>
      </Stack>

      {/* Audit Events Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Security Audit Log"
        size="xl"
      >
        <Stack gap="md">
          <Alert icon={<IconShield size={16} />} color="blue">
            Security events are automatically logged and retained according to
            your audit settings.
          </Alert>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Event Type</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>Details</Table.Th>
                <Table.Th>IP Address</Table.Th>
                <Table.Th>Timestamp</Table.Th>
                <Table.Th>Severity</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mockAuditEvents.map(event => (
                <Table.Tr key={event.id}>
                  <Table.Td>
                    <Badge variant="light">
                      {event.type.replace('_', ' ')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{event.userEmail}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{event.details}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {event.ipAddress}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {event.timestamp.toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getSeverityColor(event.severity)}
                      variant="light"
                    >
                      {event.severity}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Modal>
    </form>
  );
}
