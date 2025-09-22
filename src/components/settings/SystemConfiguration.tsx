'use client';

import { useState } from 'react';
import {
  Stack,
  Grid,
  TextInput,
  Select,
  Switch,
  Button,
  Group,
  Title,
  Text,
  Card,
  Divider,
  NumberInput,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { settingsService } from '@/lib/mock-services/settingsService';
import { SystemSettings } from '@/types';

export function SystemConfiguration() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const form = useForm({
    initialValues: {
      organizationName: 'Alumni Management System',
      defaultTimeZone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en',
      maintenanceMode: false,
      allowSelfRegistration: true,
      requireEmailVerification: true,
      enableEmailNotifications: true,
      enablePushNotifications: false,
      defaultNotificationFrequency: 'daily' as const,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      fromEmail: '',
      fromName: ''
    },
    validate: {
      organizationName: (value) => (!value ? 'Organization name is required' : null),
      smtpHost: (value, values) => 
        values.enableEmailNotifications && !value ? 'SMTP host is required when email notifications are enabled' : null,
      fromEmail: (value, values) => 
        values.enableEmailNotifications && !value ? 'From email is required when email notifications are enabled' : null,
    }
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await settingsService.updateSystemSettings({
        ...values,
        emailSettings: {
          smtpHost: values.smtpHost,
          smtpPort: values.smtpPort,
          smtpUser: values.smtpUser,
          smtpPassword: '', // Would be handled securely in real implementation
          fromEmail: values.fromEmail,
          fromName: values.fromName
        },
        notificationSettings: {
          enableEmailNotifications: values.enableEmailNotifications,
          enablePushNotifications: values.enablePushNotifications,
          defaultNotificationFrequency: values.defaultNotificationFrequency
        }
      });

      notifications.show({
        title: 'Settings Updated',
        message: 'System configuration has been saved successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update system settings',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg" pos="relative">
        <LoadingOverlay visible={loading} />

        {/* Organization Settings */}
        <Card withBorder>
          <Title order={3} mb="md">Organization Settings</Title>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Organization Name"
                placeholder="Enter organization name"
                required
                {...form.getInputProps('organizationName')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Default Language"
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' }
                ]}
                {...form.getInputProps('language')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Default Time Zone"
                searchable
                data={[
                  { value: 'America/New_York', label: 'Eastern Time (ET)' },
                  { value: 'America/Chicago', label: 'Central Time (CT)' },
                  { value: 'America/Denver', label: 'Mountain Time (MT)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
                  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
                  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' }
                ]}
                {...form.getInputProps('defaultTimeZone')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Date Format"
                data={[
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
                ]}
                {...form.getInputProps('dateFormat')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Currency"
                data={[
                  { value: 'USD', label: 'US Dollar (USD)' },
                  { value: 'EUR', label: 'Euro (EUR)' },
                  { value: 'GBP', label: 'British Pound (GBP)' },
                  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
                  { value: 'AUD', label: 'Australian Dollar (AUD)' }
                ]}
                {...form.getInputProps('currency')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* System Preferences */}
        <Card withBorder>
          <Title order={3} mb="md">System Preferences</Title>
          <Stack gap="md">
            <Switch
              label="Maintenance Mode"
              description="When enabled, only administrators can access the system"
              {...form.getInputProps('maintenanceMode', { type: 'checkbox' })}
            />
            <Switch
              label="Allow Self Registration"
              description="Allow new users to register themselves"
              {...form.getInputProps('allowSelfRegistration', { type: 'checkbox' })}
            />
            <Switch
              label="Require Email Verification"
              description="Require users to verify their email address before accessing the system"
              {...form.getInputProps('requireEmailVerification', { type: 'checkbox' })}
            />
          </Stack>
        </Card>

        {/* Notification Settings */}
        <Card withBorder>
          <Title order={3} mb="md">Notification Settings</Title>
          <Stack gap="md">
            <Switch
              label="Enable Email Notifications"
              description="Send notifications via email"
              {...form.getInputProps('enableEmailNotifications', { type: 'checkbox' })}
            />
            <Switch
              label="Enable Push Notifications"
              description="Send browser push notifications"
              {...form.getInputProps('enablePushNotifications', { type: 'checkbox' })}
            />
            <Select
              label="Default Notification Frequency"
              description="How often users receive digest notifications by default"
              data={[
                { value: 'immediate', label: 'Immediate' },
                { value: 'daily', label: 'Daily Digest' },
                { value: 'weekly', label: 'Weekly Digest' }
              ]}
              {...form.getInputProps('defaultNotificationFrequency')}
            />
          </Stack>
        </Card>

        {/* Email Configuration */}
        {form.values.enableEmailNotifications && (
          <Card withBorder>
            <Title order={3} mb="md">Email Configuration</Title>
            <Alert icon={<IconInfoCircle size={16} />} mb="md">
              Configure SMTP settings to enable email notifications and communications.
            </Alert>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="SMTP Host"
                  placeholder="smtp.gmail.com"
                  required={form.values.enableEmailNotifications}
                  {...form.getInputProps('smtpHost')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="SMTP Port"
                  placeholder="587"
                  min={1}
                  max={65535}
                  {...form.getInputProps('smtpPort')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="SMTP Username"
                  placeholder="your-email@domain.com"
                  {...form.getInputProps('smtpUser')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="From Email"
                  placeholder="noreply@yourdomain.com"
                  required={form.values.enableEmailNotifications}
                  {...form.getInputProps('fromEmail')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="From Name"
                  placeholder="Alumni Management System"
                  {...form.getInputProps('fromName')}
                />
              </Grid.Col>
            </Grid>
          </Card>
        )}

        <Divider />

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            Save Configuration
          </Button>
        </Group>
      </Stack>
    </form>
  );
}