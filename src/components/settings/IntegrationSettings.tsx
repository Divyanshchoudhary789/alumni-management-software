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
  PasswordInput,
  Alert,
  Badge,
  ActionIcon,
  Modal,
  LoadingOverlay,
  Divider,
  Code,
  CopyButton,
  Tooltip
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconAlertCircle,
  IconPlug,
  IconBrandGoogle,
  IconBrandLinkedin,
  IconBrandStripe,
  IconBrandPaypal,
  IconMail,
  IconSettings,
  IconCopy,
  IconExternalLink,
  IconRefresh
} from '@tabler/icons-react';
import { settingsService } from '@/lib/mock-services/settingsService';

interface IntegrationSettings {
  googleOAuth: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  linkedinOAuth: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  emailProvider: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
    apiKey?: string;
    domain?: string;
    region?: string;
  };
  paymentProcessor: {
    provider: 'stripe' | 'paypal' | 'none';
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  analytics: {
    googleAnalytics: {
      enabled: boolean;
      trackingId?: string;
    };
    mixpanel: {
      enabled: boolean;
      projectToken?: string;
    };
  };
  socialMedia: {
    facebook: {
      enabled: boolean;
      pageId?: string;
      accessToken?: string;
    };
    twitter: {
      enabled: boolean;
      apiKey?: string;
      apiSecret?: string;
    };
  };
}

export function IntegrationSettings() {
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');

  const form = useForm<IntegrationSettings>({
    initialValues: {
      googleOAuth: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/callback/google`
      },
      linkedinOAuth: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/callback/linkedin`
      },
      emailProvider: {
        provider: 'smtp'
      },
      paymentProcessor: {
        provider: 'none'
      },
      analytics: {
        googleAnalytics: {
          enabled: false
        },
        mixpanel: {
          enabled: false
        }
      },
      socialMedia: {
        facebook: {
          enabled: false
        },
        twitter: {
          enabled: false
        }
      }
    }
  });

  const handleSubmit = async (values: IntegrationSettings) => {
    setLoading(true);
    try {
      await settingsService.updateIntegrationSettings(values);
      notifications.show({
        title: 'Integrations Updated',
        message: 'Integration settings have been saved successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update integration settings',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (integration: string) => {
    setTestingConnection(integration);
    try {
      await settingsService.testIntegration(integration);
      notifications.show({
        title: 'Connection Successful',
        message: `${integration} integration is working correctly`,
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      notifications.show({
        title: 'Connection Failed',
        message: `Failed to connect to ${integration}`,
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const IntegrationCard = ({ 
    title, 
    description, 
    icon, 
    enabled, 
    onToggle, 
    onConfigure,
    status = 'disconnected'
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    onToggle: () => void;
    onConfigure: () => void;
    status?: 'connected' | 'disconnected' | 'error';
  }) => (
    <Card withBorder>
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          {icon}
          <div>
            <Text fw={500}>{title}</Text>
            <Text size="sm" c="dimmed">{description}</Text>
          </div>
        </Group>
        <Group gap="sm">
          <Badge 
            color={status === 'connected' ? 'green' : status === 'error' ? 'red' : 'gray'}
            variant="light"
          >
            {status}
          </Badge>
          <Switch checked={enabled} onChange={onToggle} />
        </Group>
      </Group>
      {enabled && (
        <Group justify="flex-end">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconSettings size={14} />}
            onClick={onConfigure}
          >
            Configure
          </Button>
        </Group>
      )}
    </Card>
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg" pos="relative">
        <LoadingOverlay visible={loading} />

        {/* Authentication Providers */}
        <div>
          <Title order={3} mb="md">Authentication Providers</Title>
          <Stack gap="md">
            <IntegrationCard
              title="Google OAuth"
              description="Allow users to sign in with their Google accounts"
              icon={<IconBrandGoogle size={20} color="#4285f4" />}
              enabled={form.values.googleOAuth.enabled}
              onToggle={() => form.setFieldValue('googleOAuth.enabled', !form.values.googleOAuth.enabled)}
              onConfigure={() => {
                setSelectedIntegration('google');
                open();
              }}
              status={form.values.googleOAuth.clientId ? 'connected' : 'disconnected'}
            />

            <IntegrationCard
              title="LinkedIn OAuth"
              description="Allow users to sign in with their LinkedIn accounts"
              icon={<IconBrandLinkedin size={20} color="#0077b5" />}
              enabled={form.values.linkedinOAuth.enabled}
              onToggle={() => form.setFieldValue('linkedinOAuth.enabled', !form.values.linkedinOAuth.enabled)}
              onConfigure={() => {
                setSelectedIntegration('linkedin');
                open();
              }}
              status={form.values.linkedinOAuth.clientId ? 'connected' : 'disconnected'}
            />
          </Stack>
        </div>

        {/* Email Services */}
        <div>
          <Title order={3} mb="md">Email Services</Title>
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <IconMail size={20} />
                <div>
                  <Text fw={500}>Email Provider</Text>
                  <Text size="sm" c="dimmed">Configure email delivery service</Text>
                </div>
              </Group>
            </Group>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Email Provider"
                  data={[
                    { value: 'smtp', label: 'SMTP' },
                    { value: 'sendgrid', label: 'SendGrid' },
                    { value: 'mailgun', label: 'Mailgun' },
                    { value: 'ses', label: 'Amazon SES' }
                  ]}
                  {...form.getInputProps('emailProvider.provider')}
                />
              </Grid.Col>
              {form.values.emailProvider.provider !== 'smtp' && (
                <>
                  <Grid.Col span={6}>
                    <PasswordInput
                      label="API Key"
                      placeholder="Enter API key"
                      {...form.getInputProps('emailProvider.apiKey')}
                    />
                  </Grid.Col>
                  {form.values.emailProvider.provider === 'mailgun' && (
                    <Grid.Col span={6}>
                      <TextInput
                        label="Domain"
                        placeholder="Enter domain"
                        {...form.getInputProps('emailProvider.domain')}
                      />
                    </Grid.Col>
                  )}
                  {form.values.emailProvider.provider === 'ses' && (
                    <Grid.Col span={6}>
                      <Select
                        label="Region"
                        data={[
                          { value: 'us-east-1', label: 'US East (N. Virginia)' },
                          { value: 'us-west-2', label: 'US West (Oregon)' },
                          { value: 'eu-west-1', label: 'Europe (Ireland)' }
                        ]}
                        {...form.getInputProps('emailProvider.region')}
                      />
                    </Grid.Col>
                  )}
                </>
              )}
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                size="sm"
                loading={testingConnection === 'email'}
                onClick={() => testConnection('email')}
              >
                Test Connection
              </Button>
            </Group>
          </Card>
        </div>

        {/* Payment Processors */}
        <div>
          <Title order={3} mb="md">Payment Processors</Title>
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <IconBrandStripe size={20} />
                <div>
                  <Text fw={500}>Payment Processing</Text>
                  <Text size="sm" c="dimmed">Configure donation payment processing</Text>
                </div>
              </Group>
            </Group>
            <Grid>
              <Grid.Col span={12}>
                <Select
                  label="Payment Provider"
                  data={[
                    { value: 'none', label: 'None (Disable Payments)' },
                    { value: 'stripe', label: 'Stripe' },
                    { value: 'paypal', label: 'PayPal' }
                  ]}
                  {...form.getInputProps('paymentProcessor.provider')}
                />
              </Grid.Col>
              {form.values.paymentProcessor.provider !== 'none' && (
                <>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Public Key"
                      placeholder="Enter public key"
                      {...form.getInputProps('paymentProcessor.publicKey')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <PasswordInput
                      label="Secret Key"
                      placeholder="Enter secret key"
                      {...form.getInputProps('paymentProcessor.secretKey')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <PasswordInput
                      label="Webhook Secret"
                      placeholder="Enter webhook secret"
                      {...form.getInputProps('paymentProcessor.webhookSecret')}
                    />
                  </Grid.Col>
                </>
              )}
            </Grid>
          </Card>
        </div>

        {/* Analytics */}
        <div>
          <Title order={3} mb="md">Analytics & Tracking</Title>
          <Stack gap="md">
            <Card withBorder>
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <Text fw={500}>Google Analytics</Text>
                  <Switch
                    {...form.getInputProps('analytics.googleAnalytics.enabled', { type: 'checkbox' })}
                  />
                </Group>
              </Group>
              {form.values.analytics.googleAnalytics.enabled && (
                <TextInput
                  label="Tracking ID"
                  placeholder="GA-XXXXXXXXX-X"
                  {...form.getInputProps('analytics.googleAnalytics.trackingId')}
                />
              )}
            </Card>

            <Card withBorder>
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <Text fw={500}>Mixpanel</Text>
                  <Switch
                    {...form.getInputProps('analytics.mixpanel.enabled', { type: 'checkbox' })}
                  />
                </Group>
              </Group>
              {form.values.analytics.mixpanel.enabled && (
                <TextInput
                  label="Project Token"
                  placeholder="Enter project token"
                  {...form.getInputProps('analytics.mixpanel.projectToken')}
                />
              )}
            </Card>
          </Stack>
        </div>

        <Divider />

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            Save Integration Settings
          </Button>
        </Group>
      </Stack>

      {/* Configuration Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={`Configure ${selectedIntegration === 'google' ? 'Google' : 'LinkedIn'} OAuth`}
        size="lg"
      >
        <Stack gap="md">
          <Alert icon={<IconPlug size={16} />} color="blue">
            Follow the setup instructions to configure OAuth authentication.
          </Alert>

          {selectedIntegration === 'google' && (
            <>
              <TextInput
                label="Client ID"
                placeholder="Enter Google OAuth Client ID"
                {...form.getInputProps('googleOAuth.clientId')}
              />
              <PasswordInput
                label="Client Secret"
                placeholder="Enter Google OAuth Client Secret"
                {...form.getInputProps('googleOAuth.clientSecret')}
              />
              <TextInput
                label="Redirect URI"
                value={form.values.googleOAuth.redirectUri}
                readOnly
                rightSection={
                  <CopyButton value={form.values.googleOAuth.redirectUri}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'}>
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                          <IconCopy size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                }
              />
            </>
          )}

          {selectedIntegration === 'linkedin' && (
            <>
              <TextInput
                label="Client ID"
                placeholder="Enter LinkedIn OAuth Client ID"
                {...form.getInputProps('linkedinOAuth.clientId')}
              />
              <PasswordInput
                label="Client Secret"
                placeholder="Enter LinkedIn OAuth Client Secret"
                {...form.getInputProps('linkedinOAuth.clientSecret')}
              />
              <TextInput
                label="Redirect URI"
                value={form.values.linkedinOAuth.redirectUri}
                readOnly
                rightSection={
                  <CopyButton value={form.values.linkedinOAuth.redirectUri}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'}>
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                          <IconCopy size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                }
              />
            </>
          )}

          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              leftSection={<IconExternalLink size={16} />}
              onClick={() => {
                const url = selectedIntegration === 'google' 
                  ? 'https://console.developers.google.com/'
                  : 'https://www.linkedin.com/developers/';
                window.open(url, '_blank');
              }}
            >
              Open Developer Console
            </Button>
            <Group>
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>
                Save Configuration
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </form>
  );
}