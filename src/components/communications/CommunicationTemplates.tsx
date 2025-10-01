'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Card,
  Badge,
  Modal,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  SimpleGrid,
  ActionIcon,
  Menu,
  Alert,
  LoadingOverlay,
  Box,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconTemplate,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconCopy,
  IconSend,
  IconVariable,
  IconMail,
  IconClock,
  IconRobot,
  IconCalendar,
  IconSettings,
} from '@tabler/icons-react';
import { mockCommunicationService } from '@/lib/mock-services/communicationService';
import { mockCommunicationTemplates } from '@/lib/mock-data/communications';

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
  variables?: string[];
}

interface TemplateFormData {
  name: string;
  subject: string;
  content: string;
  type: string;
  targetAudience: string[];
  variables: Record<string, string>;
}

const templateTypes = [
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
  { value: 'donors', label: 'Donors' },
  { value: 'entrepreneurs', label: 'Entrepreneurs' },
];

export function CommunicationTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [
    useTemplateOpened,
    { open: openUseTemplate, close: closeUseTemplate },
  ] = useDisclosure(false);
  const [
    createTemplateOpened,
    { open: openCreateTemplate, close: closeCreateTemplate },
  ] = useDisclosure(false);
  const [automationOpened, { open: openAutomation, close: closeAutomation }] =
    useDisclosure(false);

  const useTemplateForm = useForm<TemplateFormData>({
    initialValues: {
      name: '',
      subject: '',
      content: '',
      type: '',
      targetAudience: [],
      variables: {},
    },
    validate: {
      name: value => (!value ? 'Communication title is required' : null),
      type: value => (!value ? 'Communication type is required' : null),
      targetAudience: value =>
        value.length === 0 ? 'At least one target audience is required' : null,
    },
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await mockCommunicationService.getTemplates();
      setTemplates(response.data);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to load templates',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);

    // Extract variables from template content
    const variableMatches = template.content.match(/\[([^\]]+)\]/g) || [];
    const variables = variableMatches.reduce(
      (acc, match) => {
        const variable = match.slice(1, -1); // Remove brackets
        acc[variable] = '';
        return acc;
      },
      {} as Record<string, string>
    );

    useTemplateForm.setValues({
      name: template.subject,
      subject: template.subject,
      content: template.content,
      type: template.type,
      targetAudience: [],
      variables,
    });

    openUseTemplate();
  };

  const handleCreateFromTemplate = async () => {
    if (!useTemplateForm.validate().hasErrors && selectedTemplate) {
      try {
        const response = await mockCommunicationService.createFromTemplate(
          selectedTemplate.id,
          {
            title: useTemplateForm.values.name,
            targetAudience: useTemplateForm.values.targetAudience,
            variables: useTemplateForm.values.variables,
          }
        );

        notifications.show({
          title: 'Success',
          message: 'Communication created from template',
          color: 'green',
        });

        closeUseTemplate();
        useTemplateForm.reset();
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to create communication',
          color: 'red',
        });
      }
    }
  };

  const getVariablesFromContent = (content: string): string[] => {
    const matches = content.match(/\[([^\]]+)\]/g) || [];
    return matches.map(match => match.slice(1, -1));
  };

  const typeColors: Record<string, string> = {
    newsletter: 'blue',
    event_invitation: 'green',
    announcement: 'orange',
    fundraising: 'red',
    program_launch: 'purple',
    donation_receipt: 'teal',
    welcome: 'cyan',
    reminder: 'yellow',
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <LoadingOverlay visible={loading} />

        <Stack gap="md">
          <Group justify="space-between">
            <Text size="lg" fw={600}>
              Communication Templates
            </Text>
            <Group gap="xs">
              <Button
                leftSection={<IconRobot size={16} />}
                variant="light"
                onClick={openAutomation}
              >
                Automation
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={openCreateTemplate}
              >
                Create Template
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
            {templates.map(template => {
              const variables = getVariablesFromContent(template.content);

              return (
                <Card key={template.id} withBorder shadow="sm" padding="md">
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                      <div style={{ flex: 1 }}>
                        <Text fw={600} size="sm" lineClamp={1}>
                          {template.name}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {template.subject}
                        </Text>
                      </div>

                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => {
                              setSelectedTemplate(template);
                              openPreview();
                            }}
                          >
                            Preview
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconCopy size={14} />}
                            onClick={() => handleUseTemplate(template)}
                          >
                            Use Template
                          </Menu.Item>
                          <Menu.Item leftSection={<IconEdit size={14} />}>
                            Edit Template
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                          >
                            Delete Template
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Group gap="xs">
                      <Badge
                        color={typeColors[template.type] || 'gray'}
                        variant="light"
                        size="sm"
                      >
                        {templateTypes.find(t => t.value === template.type)
                          ?.label || template.type}
                      </Badge>

                      {variables.length > 0 && (
                        <Badge
                          variant="outline"
                          size="sm"
                          leftSection={<IconVariable size={12} />}
                        >
                          {variables.length} variable
                          {variables.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </Group>

                    <Text size="xs" c="dimmed" lineClamp={3}>
                      {template.content
                        .replace(/<[^>]*>/g, '')
                        .substring(0, 100)}
                      ...
                    </Text>

                    <Group gap="xs" mt="auto">
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconEye size={12} />}
                        onClick={() => {
                          setSelectedTemplate(template);
                          openPreview();
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        size="xs"
                        leftSection={<IconCopy size={12} />}
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>

          {templates.length === 0 && !loading && (
            <Alert
              icon={<IconTemplate size={16} />}
              color="blue"
              variant="light"
            >
              <Text size="sm">
                No templates available. Create your first template to get
                started with consistent communications.
              </Text>
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* Preview Modal */}
      <Modal
        opened={previewOpened}
        onClose={closePreview}
        title="Template Preview"
        size="lg"
      >
        {selectedTemplate && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={600} size="lg">
                  {selectedTemplate.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedTemplate.subject}
                </Text>
              </div>
              <Badge
                color={typeColors[selectedTemplate.type] || 'gray'}
                variant="light"
              >
                {templateTypes.find(t => t.value === selectedTemplate.type)
                  ?.label || selectedTemplate.type}
              </Badge>
            </Group>

            {getVariablesFromContent(selectedTemplate.content).length > 0 && (
              <Alert
                icon={<IconVariable size={16} />}
                color="blue"
                variant="light"
              >
                <Text size="sm">
                  <strong>Variables:</strong>{' '}
                  {getVariablesFromContent(selectedTemplate.content).join(', ')}
                </Text>
              </Alert>
            )}

            <Divider />

            <Box
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-sm)',
                padding: 'var(--mantine-spacing-md)',
                minHeight: '200px',
                maxHeight: '400px',
                overflow: 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
            />
          </Stack>
        )}
      </Modal>

      {/* Use Template Modal */}
      <Modal
        opened={useTemplateOpened}
        onClose={closeUseTemplate}
        title="Create Communication from Template"
        size="lg"
      >
        {selectedTemplate && (
          <form onSubmit={useTemplateForm.onSubmit(handleCreateFromTemplate)}>
            <Stack gap="md">
              <Group grow>
                <TextInput
                  label="Communication Title"
                  placeholder="Enter communication title"
                  required
                  {...useTemplateForm.getInputProps('name')}
                />
                <Select
                  label="Communication Type"
                  data={templateTypes}
                  required
                  {...useTemplateForm.getInputProps('type')}
                />
              </Group>

              <MultiSelect
                label="Target Audience"
                placeholder="Select target audiences"
                data={audienceOptions}
                required
                searchable
                {...useTemplateForm.getInputProps('targetAudience')}
              />

              {Object.keys(useTemplateForm.values.variables).length > 0 && (
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Template Variables
                  </Text>
                  <Alert
                    icon={<IconVariable size={16} />}
                    color="blue"
                    variant="light"
                  >
                    <Text size="sm">
                      Fill in the variables below to customize your
                      communication.
                    </Text>
                  </Alert>

                  {Object.keys(useTemplateForm.values.variables).map(
                    variable => (
                      <TextInput
                        key={variable}
                        label={variable
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, l => l.toUpperCase())}
                        placeholder={`Enter ${variable.toLowerCase()}`}
                        value={useTemplateForm.values.variables[variable]}
                        onChange={e =>
                          useTemplateForm.setFieldValue(
                            `variables.${variable}`,
                            e.target.value
                          )
                        }
                      />
                    )
                  )}
                </Stack>
              )}

              <Divider />

              <Group justify="space-between">
                <Button variant="light" onClick={closeUseTemplate}>
                  Cancel
                </Button>
                <Button type="submit" leftSection={<IconMail size={16} />}>
                  Create Communication
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>

      {/* Create Template Modal */}
      <Modal
        opened={createTemplateOpened}
        onClose={closeCreateTemplate}
        title="Create New Template"
        size="lg"
      >
        <Alert color="blue" variant="light" mb="md">
          <Text size="sm">
            Template creation functionality would be implemented here. This
            would include a form to create custom templates with variables and
            rich text editing.
          </Text>
        </Alert>
      </Modal>

      {/* Automation & Scheduling Modal */}
      <Modal
        opened={automationOpened}
        onClose={closeAutomation}
        title="Communication Automation & Scheduling"
        size="xl"
      >
        <Stack gap="md">
          {/* Automated Campaigns */}
          <Card withBorder p="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Automated Campaigns</Text>
              <Button size="xs" leftSection={<IconPlus size={12} />}>
                New Campaign
              </Button>
            </Group>

            <Stack gap="sm">
              <Paper p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Welcome Series
                    </Text>
                    <Text size="xs" c="dimmed">
                      Triggered when new alumni join
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Badge color="green" variant="light" size="sm">
                      Active
                    </Badge>
                    <ActionIcon size="sm" variant="light">
                      <IconSettings size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>

              <Paper p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Event Reminders
                    </Text>
                    <Text size="xs" c="dimmed">
                      Sent 3 days before registered events
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Badge color="blue" variant="light" size="sm">
                      Active
                    </Badge>
                    <ActionIcon size="sm" variant="light">
                      <IconSettings size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>

              <Paper p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Donation Thank You
                    </Text>
                    <Text size="xs" c="dimmed">
                      Triggered after donation completion
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Badge color="gray" variant="light" size="sm">
                      Paused
                    </Badge>
                    <ActionIcon size="sm" variant="light">
                      <IconSettings size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            </Stack>
          </Card>

          {/* Scheduled Communications */}
          <Card withBorder p="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Scheduled Communications</Text>
              <Button size="xs" leftSection={<IconCalendar size={12} />}>
                Schedule New
              </Button>
            </Group>

            <Stack gap="sm">
              <Paper p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Monthly Newsletter - March
                    </Text>
                    <Group gap="xs">
                      <IconClock size={12} />
                      <Text size="xs" c="dimmed">
                        Scheduled for March 1, 2024 at 9:00 AM
                      </Text>
                    </Group>
                  </div>
                  <Group gap="xs">
                    <Badge color="blue" variant="light" size="sm">
                      Scheduled
                    </Badge>
                    <ActionIcon size="sm" variant="light">
                      <IconEdit size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>

              <Paper p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Alumni Gala Invitation
                    </Text>
                    <Group gap="xs">
                      <IconClock size={12} />
                      <Text size="xs" c="dimmed">
                        Scheduled for April 15, 2024 at 10:00 AM
                      </Text>
                    </Group>
                  </div>
                  <Group gap="xs">
                    <Badge color="blue" variant="light" size="sm">
                      Scheduled
                    </Badge>
                    <ActionIcon size="sm" variant="light">
                      <IconEdit size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            </Stack>
          </Card>

          {/* Recurring Communications */}
          <Card withBorder p="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Recurring Communications</Text>
              <Button size="xs" leftSection={<IconRobot size={12} />}>
                New Recurring
              </Button>
            </Group>

            <Stack gap="sm">
              <Paper p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Monthly Newsletter
                    </Text>
                    <Text size="xs" c="dimmed">
                      Every 1st of the month at 9:00 AM
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Badge color="green" variant="light" size="sm">
                      Active
                    </Badge>
                    <ActionIcon size="sm" variant="light">
                      <IconSettings size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>

              <Paper p="sm" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>
                      Weekly Job Board Digest
                    </Text>
                    <Text size="xs" c="dimmed">
                      Every Friday at 2:00 PM
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Badge color="green" variant="light" size="sm">
                      Active
                    </Badge>
                    <ActionIcon size="sm" variant="light">
                      <IconSettings size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            </Stack>
          </Card>

          {/* Automation Rules */}
          <Card withBorder p="md">
            <Text fw={600} mb="md">
              Automation Rules
            </Text>
            <Alert color="blue" variant="light">
              <Stack gap="xs">
                <Text size="sm">
                  <strong>🤖 Smart Timing:</strong> Communications are
                  automatically optimized for best engagement times
                </Text>
                <Text size="sm">
                  <strong>📊 A/B Testing:</strong> Subject lines are
                  automatically tested for better open rates
                </Text>
                <Text size="sm">
                  <strong>🎯 Audience Segmentation:</strong> Content is
                  personalized based on alumni preferences
                </Text>
                <Text size="sm">
                  <strong>📈 Performance Monitoring:</strong> Low-performing
                  campaigns are automatically flagged
                </Text>
              </Stack>
            </Alert>
          </Card>
        </Stack>
      </Modal>
    </Stack>
  );
}
