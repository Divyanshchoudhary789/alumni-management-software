'use client';

import { Container, Tabs, Title, Paper, Group, Text } from '@mantine/core';
import {
  IconSettings,
  IconUsers,
  IconPalette,
  IconPlug,
  IconShield,
} from '@tabler/icons-react';
import { SystemConfiguration } from '@/components/settings/SystemConfiguration';
import { UserManagement } from '@/components/settings/UserManagement';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { IntegrationSettings } from '@/components/settings/IntegrationSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';

export default function SettingsPage() {
  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>System Settings</Title>
          <Text c="dimmed" size="sm">
            Configure system preferences, manage users, and customize your
            alumni management platform
          </Text>
        </div>
      </Group>

      <Paper shadow="sm" radius="md" p="md">
        <Tabs defaultValue="system" orientation="horizontal">
          <Tabs.List>
            <Tabs.Tab value="system" leftSection={<IconSettings size={16} />}>
              System Configuration
            </Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              User Management
            </Tabs.Tab>
            <Tabs.Tab value="branding" leftSection={<IconPalette size={16} />}>
              Branding & Customization
            </Tabs.Tab>
            <Tabs.Tab value="integrations" leftSection={<IconPlug size={16} />}>
              Integrations
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
              Security & Permissions
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="system" pt="md">
            <SystemConfiguration />
          </Tabs.Panel>

          <Tabs.Panel value="users" pt="md">
            <UserManagement />
          </Tabs.Panel>

          <Tabs.Panel value="branding" pt="md">
            <BrandingSettings />
          </Tabs.Panel>

          <Tabs.Panel value="integrations" pt="md">
            <IntegrationSettings />
          </Tabs.Panel>

          <Tabs.Panel value="security" pt="md">
            <SecuritySettings />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}
