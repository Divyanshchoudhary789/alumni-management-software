'use client';

import { useState } from 'react';
import {
  Paper,
  Stack,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Text,
  Alert,
  Modal,
  Divider,
  Badge,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
  Box,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSend,
  IconClock,
  IconEye,
  IconDeviceFloppy,
  IconTemplate,
  IconUsers,
  IconBulb,
} from '@tabler/icons-react';
import { mockCommunicationService } from '@/lib/mock-services/communicationService';
import { mockCommunicationTemplates } from '@/lib/mock-data/communications';

interface CommunicationFormData {
  title: string;
  content: string;
  type: string;
  targetAudience: string[];
  scheduleDate?: Date;
}

const communicationTypes = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'event_invitation', label: 'Event Invitation' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'program_launch', label: 'Program Launch' },
  { value: 'donation_receipt', label: 'Donation Receipt' },
  { value: 'welcome', label: 'Welcome Message' },
  { value: 'reminder', label: 'Reminder' },
];

const audienceOptions = [
  { value: 'all', label: 'All Alumni' },
  { value: 'recent_graduates', label: 'Recent Graduates (2020-2024)' },
  { value: 'tech', label: 'Technology Alumni' },
  { value: 'business', label: 'Business Alumni' },
  { value: 'engineering', label: 'Engineering Alumni' },
  { value: 'computer_science', label: 'Computer Science Alumni' },
  { value: 'donors', label: 'Donors' },
  { value: 'major_donors', label: 'Major Donors' },
  { value: 'entrepreneurs', label: 'Entrepreneurs' },
  { value: 'leadership', label: 'Leadership Alumni' },
  { value: 'experienced', label: 'Experienced Professionals (10+ years)' },
  { value: 'regional_sf', label: 'San Francisco Region' },
  { value: 'regional_ny', label: 'New York Region' },
  { value: 'regional_la', label: 'Los Angeles Region' },
];

export function CommunicationCreator() {
  const [loading, setLoading] = useState(false);
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [
    templateModalOpened,
    { open: openTemplateModal, close: closeTemplateModal },
  ] = useDisclosure(false);
  const [
    sendConfirmOpened,
    { open: openSendConfirm, close: closeSendConfirm },
  ] = useDisclosure(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const form = useForm<CommunicationFormData>({
    initialValues: {
      title: '',
      content: '',
      type: '',
      targetAudience: [],
      scheduleDate: undefined,
    },
    validate: {
      title: value => (!value ? 'Title is required' : null),
      content: value =>
        !value || value.trim() === '<p></p>' ? 'Content is required' : null,
      type: value => (!value ? 'Communication type is required' : null),
      targetAudience: value =>
        value.length === 0 ? 'At least one target audience is required' : null,
      scheduleDate: value => {
        if (scheduleMode && (!value || value <= new Date())) {
          return 'Schedule date must be in the future';
        }
        return null;
      },
    },
  });

  // Simplified content editing without rich text editor

  const handleSave = async (status: 'draft' | 'send' | 'schedule') => {
    if (!form.validate().hasErrors) {
      setLoading(true);
      try {
        if (status === 'draft') {
          await mockCommunicationService.createCommunication({
            title: form.values.title,
            content: form.values.content,
            type: form.values.type,
            targetAudience: form.values.targetAudience,
            createdBy: 'current_user',
          });

          notifications.show({
            title: 'Success',
            message: 'Communication saved as draft',
            color: 'green',
          });

          form.reset();
          editor?.commands.setContent('');
        } else if (status === 'send') {
          // First create the communication
          const createResponse =
            await mockCommunicationService.createCommunication({
              title: form.values.title,
              content: form.values.content,
              type: form.values.type,
              targetAudience: form.values.targetAudience,
              createdBy: 'current_user',
            });

          // Then send it
          await mockCommunicationService.sendCommunication(
            createResponse.data.id
          );

          notifications.show({
            title: 'Success',
            message: 'Communication sent successfully',
            color: 'green',
          });

          form.reset();
          editor?.commands.setContent('');
        } else if (status === 'schedule') {
          // First create the communication
          const createResponse =
            await mockCommunicationService.createCommunication({
              title: form.values.title,
              content: form.values.content,
              type: form.values.type,
              targetAudience: form.values.targetAudience,
              createdBy: 'current_user',
            });

          // Then schedule it
          await mockCommunicationService.sendCommunication(
            createResponse.data.id,
            form.values.scheduleDate
          );

          notifications.show({
            title: 'Success',
            message: `Communication scheduled for ${form.values.scheduleDate?.toLocaleDateString()}`,
            color: 'blue',
          });

          form.reset();
          editor?.commands.setContent('');
          setScheduleMode(false);
        }

        closeSendConfirm();
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to save communication',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const getAudienceEstimate = (audiences: string[]) => {
    // Mock audience size calculation
    const audienceSizes: Record<string, number> = {
      all: 2500,
      recent_graduates: 450,
      tech: 680,
      business: 520,
      engineering: 750,
      computer_science: 380,
      donors: 320,
      major_donors: 85,
      entrepreneurs: 180,
      leadership: 150,
      experienced: 890,
      regional_sf: 420,
      regional_ny: 380,
      regional_la: 290,
    };

    if (audiences.includes('all')) return audienceSizes.all;

    return audiences.reduce((total, audience) => {
      return total + (audienceSizes[audience] || 0);
    }, 0);
  };

  const estimatedReach = getAudienceEstimate(form.values.targetAudience);

  const handleTemplateSelect = (templateId: string) => {
    const template = mockCommunicationTemplates.find(t => t.id === templateId);
    if (template) {
      form.setValues({
        title: template.subject,
        content: template.content,
        type: template.type,
        targetAudience: form.values.targetAudience, // Keep existing audience selection
        scheduleDate: form.values.scheduleDate,
      });
      editor?.commands.setContent(template.content);
      setSelectedTemplate(templateId);
      closeTemplateModal();

      notifications.show({
        title: 'Template Applied',
        message: `Template "${template.name}" has been applied`,
        color: 'blue',
      });
    }
  };

  return (
    <Paper p="md" withBorder>
      <LoadingOverlay visible={loading} />

      <form>
        <Stack gap="md">
          {/* Header with quick actions */}
          <Group justify="space-between">
            <Text size="lg" fw={600}>
              Create New Communication
            </Text>
            <Group gap="xs">
              <Tooltip label="Use Template">
                <ActionIcon variant="light" onClick={openTemplateModal}>
                  <IconTemplate size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Preview">
                <ActionIcon variant="light" onClick={openPreview}>
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {/* Basic Information */}
          <Group grow>
            <TextInput
              label="Communication Title"
              placeholder="Enter communication title"
              required
              {...form.getInputProps('title')}
            />
            <Select
              label="Communication Type"
              placeholder="Select type"
              data={communicationTypes}
              required
              {...form.getInputProps('type')}
            />
          </Group>

          {/* Target Audience */}
          <Stack gap="xs">
            <MultiSelect
              label="Target Audience"
              placeholder="Select target audiences"
              data={audienceOptions}
              required
              searchable
              {...form.getInputProps('targetAudience')}
            />
            {form.values.targetAudience.length > 0 && (
              <Group gap="xs">
                <IconUsers size={16} />
                <Text size="sm" c="dimmed">
                  Estimated reach:{' '}
                  <Text span fw={600}>
                    {estimatedReach.toLocaleString()}
                  </Text>{' '}
                  recipients
                </Text>
              </Group>
            )}
          </Stack>

          {/* Content Editor */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Content
            </Text>
            <Textarea
              placeholder="Write your communication content here..."
              minRows={10}
              {...form.getInputProps('content')}
            />
            {form.errors.content && (
              <Text size="sm" c="red">
                {form.errors.content}
              </Text>
            )}
          </Stack>

          {/* Scheduling */}
          {scheduleMode && (
            <DateTimePicker
              label="Schedule Date & Time"
              placeholder="Select when to send"
              required
              minDate={new Date()}
              {...form.getInputProps('scheduleDate')}
            />
          )}

          <Divider />

          {/* Action Buttons */}
          <Group justify="space-between">
            <Group gap="xs">
              <Button
                variant="light"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={() => handleSave('draft')}
                disabled={!form.values.title || !form.values.content}
              >
                Save Draft
              </Button>

              <Button
                variant="light"
                color="blue"
                leftSection={<IconClock size={16} />}
                onClick={() => setScheduleMode(!scheduleMode)}
              >
                {scheduleMode ? 'Cancel Schedule' : 'Schedule'}
              </Button>
            </Group>

            <Button
              leftSection={
                scheduleMode ? <IconClock size={16} /> : <IconSend size={16} />
              }
              onClick={openSendConfirm}
              disabled={!form.isValid()}
            >
              {scheduleMode ? 'Schedule Send' : 'Send Now'}
            </Button>
          </Group>

          {/* Tips */}
          <Alert icon={<IconBulb size={16} />} color="blue" variant="light">
            <Text size="sm">
              <strong>Tips:</strong> Use templates for consistent formatting,
              preview before sending, and consider your audience when choosing
              the communication type.
            </Text>
          </Alert>
        </Stack>
      </form>

      {/* Preview Modal */}
      <Modal
        opened={previewOpened}
        onClose={closePreview}
        title="Communication Preview"
        size="lg"
      >
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text fw={600}>
                {form.values.title || 'Untitled Communication'}
              </Text>
              <Text size="sm" c="dimmed">
                Type:{' '}
                {communicationTypes.find(t => t.value === form.values.type)
                  ?.label || 'Not selected'}
              </Text>
            </div>
            <Group gap="xs">
              {form.values.targetAudience.map(audience => (
                <Badge key={audience} size="sm" variant="light">
                  {audienceOptions.find(a => a.value === audience)?.label}
                </Badge>
              ))}
            </Group>
          </Group>

          <Divider />

          <Box
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-sm)',
              padding: 'var(--mantine-spacing-md)',
              minHeight: '200px',
            }}
            dangerouslySetInnerHTML={{
              __html: form.values.content || '<p>No content</p>',
            }}
          />
        </Stack>
      </Modal>

      {/* Send Confirmation Modal */}
      <Modal
        opened={sendConfirmOpened}
        onClose={closeSendConfirm}
        title={scheduleMode ? 'Schedule Communication' : 'Send Communication'}
        size="md"
      >
        <Stack gap="md">
          <Alert color="blue" variant="light">
            <Text size="sm">
              {scheduleMode
                ? `This communication will be scheduled to send on ${form.values.scheduleDate?.toLocaleString()}`
                : 'This communication will be sent immediately'}{' '}
              to approximately{' '}
              <strong>{estimatedReach.toLocaleString()}</strong> recipients.
            </Text>
          </Alert>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeSendConfirm}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSave(scheduleMode ? 'schedule' : 'send')}
              loading={loading}
            >
              {scheduleMode ? 'Schedule' : 'Send'} Communication
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Template Selection Modal */}
      <Modal
        opened={templateModalOpened}
        onClose={closeTemplateModal}
        title="Choose Communication Template"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select a template to get started quickly. You can customize the
            content after applying.
          </Text>

          <Stack gap="xs">
            {mockCommunicationTemplates.map(template => (
              <Paper
                key={template.id}
                p="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor:
                    selectedTemplate === template.id
                      ? 'var(--mantine-color-blue-0)'
                      : undefined,
                  borderColor:
                    selectedTemplate === template.id
                      ? 'var(--mantine-color-blue-4)'
                      : undefined,
                }}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb="xs">
                      <Text fw={600}>{template.name}</Text>
                      <Badge size="sm" variant="light" color="blue">
                        {communicationTypes.find(t => t.value === template.type)
                          ?.label || template.type}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {template.subject}
                    </Text>
                  </div>
                </Group>
              </Paper>
            ))}
          </Stack>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeTemplateModal}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
