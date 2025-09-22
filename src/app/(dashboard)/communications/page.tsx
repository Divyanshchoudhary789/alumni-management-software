'use client';

import { useState } from 'react';
import { Container, Title, Tabs, rem } from '@mantine/core';
import { IconPlus, IconHistory, IconTemplate } from '@tabler/icons-react';
import { CommunicationCreator } from '@/components/communications/CommunicationCreator';
import { CommunicationHistory } from '@/components/communications/CommunicationHistory';
import { CommunicationTemplates } from '@/components/communications/CommunicationTemplates';

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('create');

  const iconStyle = { width: rem(12), height: rem(12) };

  return (
    <Container size="xl" py="md">
      <Title order={1} mb="xl">Communications</Title>
      
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="create" leftSection={<IconPlus style={iconStyle} />}>
            Create Communication
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory style={iconStyle} />}>
            Communication History
          </Tabs.Tab>
          <Tabs.Tab value="templates" leftSection={<IconTemplate style={iconStyle} />}>
            Templates
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="create" pt="md">
          <CommunicationCreator />
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <CommunicationHistory />
        </Tabs.Panel>

        <Tabs.Panel value="templates" pt="md">
          <CommunicationTemplates />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}