'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Button,
  Card,
  Text,
  Title,
  Badge,
  Textarea,
  Select,
  Modal,
  Alert,
  Timeline,
  Avatar,
  ActionIcon,
  Menu,
  Grid,
  Progress,
  Tabs,
  SimpleGrid,
  ThemeIcon,
  LoadingOverlay
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconMessage,
  IconCalendar,
  IconTarget,
  IconProgress,
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconCheck,
  IconClock,
  IconUsers,
  IconNotes,
  IconTrendingUp,
  IconInfoCircle
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

interface MentorshipCommunicationProps {
  connectionId: string;
  mentorName: string;
  menteeName: string;
  connectionStatus: 'active' | 'completed' | 'pending' | 'paused' | 'cancelled';
}

interface CommunicationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'mentor' | 'mentee' | 'admin';
  message: string;
  timestamp: Date;
  type: 'message' | 'meeting_scheduled' | 'goal_set' | 'milestone_reached' | 'note';
}

interface MentorshipGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdAt: Date;
}

interface MeetingRecord {
  id: string;
  scheduledDate: Date;
  duration: number;
  topics: string[];
  notes: string;
  attendees: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export function MentorshipCommunication({
  connectionId,
  mentorName,
  menteeName,
  connectionStatus
}: MentorshipCommunicationProps) {
  const [activeTab, setActiveTab] = useState<string>('messages');
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [goals, setGoals] = useState<MentorshipGoal[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messageModalOpened, { open: openMessageModal, close: closeMessageModal }] = useDisclosure(false);
  const [goalModalOpened, { open: openGoalModal, close: closeGoalModal }] = useDisclosure(false);
  const [meetingModalOpened, { open: openMeetingModal, close: closeMeetingModal }] = useDisclosure(false);

  // Mock data for demonstration
  useEffect(() => {
    loadCommunicationData();
  }, [connectionId]);

  const loadCommunicationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - in real app, this would come from API
      const mockMessages: CommunicationMessage[] = [
        {
          id: '1',
          senderId: 'mentor1',
          senderName: mentorName,
          senderRole: 'mentor',
          message: 'Welcome to our mentorship! I\'m excited to work with you on your career goals.',
          timestamp: new Date('2024-02-01T10:00:00'),
          type: 'message'
        },
        {
          id: '2',
          senderId: 'mentee1',
          senderName: menteeName,
          senderRole: 'mentee',
          message: 'Thank you! I\'m looking forward to learning from your experience.',
          timestamp: new Date('2024-02-01T14:30:00'),
          type: 'message'
        },
        {
          id: '3',
          senderId: 'mentor1',
          senderName: mentorName,
          senderRole: 'mentor',
          message: 'I\'ve scheduled our first meeting for next week. Let\'s discuss your career objectives.',
          timestamp: new Date('2024-02-02T09:15:00'),
          type: 'meeting_scheduled'
        }
      ];

      const mockGoals: MentorshipGoal[] = [
        {
          id: '1',
          title: 'Complete Technical Skills Assessment',
          description: 'Evaluate current technical skills and identify areas for improvement',
          targetDate: new Date('2024-03-01'),
          status: 'completed',
          progress: 100,
          createdAt: new Date('2024-02-01')
        },
        {
          id: '2',
          title: 'Build Portfolio Website',
          description: 'Create a professional portfolio showcasing projects and skills',
          targetDate: new Date('2024-04-15'),
          status: 'in_progress',
          progress: 65,
          createdAt: new Date('2024-02-05')
        },
        {
          id: '3',
          title: 'Network with Industry Professionals',
          description: 'Attend 3 networking events and connect with 10 professionals',
          targetDate: new Date('2024-05-30'),
          status: 'pending',
          progress: 0,
          createdAt: new Date('2024-02-10')
        }
      ];

      const mockMeetings: MeetingRecord[] = [
        {
          id: '1',
          scheduledDate: new Date('2024-02-08T15:00:00'),
          duration: 60,
          topics: ['Career Goals', 'Skill Assessment', 'Action Plan'],
          notes: 'Great first meeting. Discussed career objectives and created initial action plan.',
          attendees: [mentorName, menteeName],
          status: 'completed'
        },
        {
          id: '2',
          scheduledDate: new Date('2024-02-22T15:00:00'),
          duration: 45,
          topics: ['Portfolio Review', 'Technical Interview Prep'],
          notes: 'Reviewed portfolio progress and practiced technical interview questions.',
          attendees: [mentorName, menteeName],
          status: 'completed'
        },
        {
          id: '3',
          scheduledDate: new Date('2024-03-08T15:00:00'),
          duration: 60,
          topics: ['Networking Strategy', 'Industry Insights'],
          notes: '',
          attendees: [mentorName, menteeName],
          status: 'scheduled'
        }
      ];

      setMessages(mockMessages);
      setGoals(mockGoals);
      setMeetings(mockMeetings);
    } catch (err: any) {
      setError(err.message || 'Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      case 'scheduled': return 'blue';
      default: return 'gray';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'meeting_scheduled': return <IconCalendar size={16} />;
      case 'goal_set': return <IconTarget size={16} />;
      case 'milestone_reached': return <IconTrendingUp size={16} />;
      case 'note': return <IconNotes size={16} />;
      default: return <IconMessage size={16} />;
    }
  };

  return (
    <Stack gap="md">
      {error && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {/* Header */}
      <Card withBorder>
        <Group justify="space-between">
          <div>
            <Title order={4}>Mentorship Communication</Title>
            <Text size="sm" c="dimmed">
              {mentorName} ↔ {menteeName}
            </Text>
          </div>
          <Badge color={getStatusColor(connectionStatus)} size="lg">
            {connectionStatus}
          </Badge>
        </Group>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />}>
            Messages ({messages.length})
          </Tabs.Tab>
          <Tabs.Tab value="goals" leftSection={<IconTarget size={16} />}>
            Goals ({goals.length})
          </Tabs.Tab>
          <Tabs.Tab value="meetings" leftSection={<IconCalendar size={16} />}>
            Meetings ({meetings.length})
          </Tabs.Tab>
          <Tabs.Tab value="progress" leftSection={<IconProgress size={16} />}>
            Progress
          </Tabs.Tab>
        </Tabs.List>

        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />

          {/* Messages Tab */}
          <Tabs.Panel value="messages" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500}>Communication Timeline</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={openMessageModal}
                  disabled={connectionStatus !== 'active'}
                >
                  Add Message
                </Button>
              </Group>

              <Card withBorder>
                <Timeline active={messages.length} bulletSize={24} lineWidth={2}>
                  {messages.map((message) => (
                    <Timeline.Item
                      key={message.id}
                      bullet={getMessageIcon(message.type)}
                      title={
                        <Group gap="xs">
                          <Text fw={500}>{message.senderName}</Text>
                          <Badge size="xs" variant="light">
                            {message.senderRole}
                          </Badge>
                        </Group>
                      }
                    >
                      <Text size="sm" mb="xs">
                        {message.message}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatDate(message.timestamp)}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Goals Tab */}
          <Tabs.Panel value="goals" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500}>Mentorship Goals</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={openGoalModal}
                  disabled={connectionStatus !== 'active'}
                >
                  Add Goal
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {goals.map((goal) => (
                  <Card key={goal.id} withBorder>
                    <Group justify="space-between" mb="sm">
                      <Text fw={500}>{goal.title}</Text>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={14} />}>
                            Edit Goal
                          </Menu.Item>
                          <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                            Delete Goal
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Text size="sm" c="dimmed" mb="md">
                      {goal.description}
                    </Text>

                    <Group justify="space-between" mb="xs">
                      <Text size="sm">Progress</Text>
                      <Text size="sm" fw={500}>{goal.progress}%</Text>
                    </Group>
                    <Progress value={goal.progress} mb="sm" color={getStatusColor(goal.status)} />

                    <Group justify="space-between">
                      <Badge color={getStatusColor(goal.status)} size="sm">
                        {goal.status.replace('_', ' ')}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        Due: {formatDate(goal.targetDate)}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>

          {/* Meetings Tab */}
          <Tabs.Panel value="meetings" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500}>Meeting History</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={openMeetingModal}
                  disabled={connectionStatus !== 'active'}
                >
                  Schedule Meeting
                </Button>
              </Group>

              <Stack gap="sm">
                {meetings.map((meeting) => (
                  <Card key={meeting.id} withBorder>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group mb="sm">
                          <ThemeIcon size="sm" variant="light" color={getStatusColor(meeting.status)}>
                            <IconCalendar size={14} />
                          </ThemeIcon>
                          <Text fw={500}>
                            {formatDate(meeting.scheduledDate)}
                          </Text>
                          <Badge color={getStatusColor(meeting.status)} size="sm">
                            {meeting.status}
                          </Badge>
                        </Group>

                        <Text size="sm" c="dimmed" mb="xs">
                          Duration: {meeting.duration} minutes
                        </Text>

                        <Group gap="xs" mb="sm">
                          <Text size="sm" fw={500}>Topics:</Text>
                          {meeting.topics.map((topic, index) => (
                            <Badge key={index} size="xs" variant="light">
                              {topic}
                            </Badge>
                          ))}
                        </Group>

                        {meeting.notes && (
                          <Text size="sm">{meeting.notes}</Text>
                        )}
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Text size="sm" fw={500} mb="xs">Attendees</Text>
                        <Stack gap="xs">
                          {meeting.attendees.map((attendee, index) => (
                            <Group key={index} gap="xs">
                              <Avatar size="xs" />
                              <Text size="sm">{attendee}</Text>
                            </Group>
                          ))}
                        </Stack>
                      </Grid.Col>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Tabs.Panel>

          {/* Progress Tab */}
          <Tabs.Panel value="progress" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder>
                  <Title order={5} mb="md">Goal Progress Overview</Title>
                  <Stack gap="md">
                    {goals.map((goal) => (
                      <div key={goal.id}>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm">{goal.title}</Text>
                          <Text size="sm" fw={500}>{goal.progress}%</Text>
                        </Group>
                        <Progress value={goal.progress} color={getStatusColor(goal.status)} />
                      </div>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder>
                  <Title order={5} mb="md">Mentorship Statistics</Title>
                  <SimpleGrid cols={2} spacing="md">
                    <div>
                      <Group gap="xs" mb="xs">
                        <IconUsers size={16} />
                        <Text size="sm">Total Meetings</Text>
                      </Group>
                      <Text size="xl" fw={700}>{meetings.length}</Text>
                    </div>

                    <div>
                      <Group gap="xs" mb="xs">
                        <IconTarget size={16} />
                        <Text size="sm">Goals Set</Text>
                      </Group>
                      <Text size="xl" fw={700}>{goals.length}</Text>
                    </div>

                    <div>
                      <Group gap="xs" mb="xs">
                        <IconCheck size={16} />
                        <Text size="sm">Goals Completed</Text>
                      </Group>
                      <Text size="xl" fw={700}>
                        {goals.filter(g => g.status === 'completed').length}
                      </Text>
                    </div>

                    <div>
                      <Group gap="xs" mb="xs">
                        <IconClock size={16} />
                        <Text size="sm">Total Hours</Text>
                      </Group>
                      <Text size="xl" fw={700}>
                        {Math.round(meetings.reduce((sum, m) => sum + m.duration, 0) / 60)}
                      </Text>
                    </div>
                  </SimpleGrid>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </div>
      </Tabs>

      {/* Modals */}
      <Modal opened={messageModalOpened} onClose={closeMessageModal} title="Add Message">
        <MessageForm onSave={closeMessageModal} onCancel={closeMessageModal} />
      </Modal>

      <Modal opened={goalModalOpened} onClose={closeGoalModal} title="Add Goal">
        <GoalForm onSave={closeGoalModal} onCancel={closeGoalModal} />
      </Modal>

      <Modal opened={meetingModalOpened} onClose={closeMeetingModal} title="Schedule Meeting">
        <MeetingForm onSave={closeMeetingModal} onCancel={closeMeetingModal} />
      </Modal>
    </Stack>
  );
}

// Message Form Component
function MessageForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const form = useForm({
    initialValues: {
      message: '',
      type: 'message'
    },
    validate: {
      message: (value) => value.length < 1 ? 'Message is required' : null
    }
  });

  const handleSubmit = (values: typeof form.values) => {
    // In real app, save to API
    console.log('Saving message:', values);
    onSave();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Select
          label="Message Type"
          data={[
            { value: 'message', label: 'Regular Message' },
            { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
            { value: 'goal_set', label: 'Goal Set' },
            { value: 'milestone_reached', label: 'Milestone Reached' },
            { value: 'note', label: 'Note' }
          ]}
          {...form.getInputProps('type')}
        />

        <Textarea
          label="Message"
          placeholder="Enter your message..."
          rows={4}
          required
          {...form.getInputProps('message')}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Send Message
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// Goal Form Component
function GoalForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      targetDate: null as Date | null
    },
    validate: {
      title: (value) => value.length < 1 ? 'Title is required' : null,
      description: (value) => value.length < 1 ? 'Description is required' : null,
      targetDate: (value) => !value ? 'Target date is required' : null
    }
  });

  const handleSubmit = (values: typeof form.values) => {
    // In real app, save to API
    console.log('Saving goal:', values);
    onSave();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Textarea
          label="Goal Title"
          placeholder="Enter goal title..."
          required
          {...form.getInputProps('title')}
        />

        <Textarea
          label="Description"
          placeholder="Describe the goal..."
          rows={3}
          required
          {...form.getInputProps('description')}
        />

        <DateInput
          label="Target Date"
          placeholder="Select target date"
          required
          {...form.getInputProps('targetDate')}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Create Goal
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// Meeting Form Component
function MeetingForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const form = useForm({
    initialValues: {
      scheduledDate: null as Date | null,
      duration: 60,
      topics: [] as string[],
      notes: ''
    },
    validate: {
      scheduledDate: (value) => !value ? 'Meeting date is required' : null,
      duration: (value) => value < 15 ? 'Duration must be at least 15 minutes' : null
    }
  });

  const handleSubmit = (values: typeof form.values) => {
    // In real app, save to API
    console.log('Scheduling meeting:', values);
    onSave();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <DateInput
          label="Meeting Date & Time"
          placeholder="Select date and time"
          required
          {...form.getInputProps('scheduledDate')}
        />

        <Select
          label="Duration (minutes)"
          data={[
            { value: '30', label: '30 minutes' },
            { value: '45', label: '45 minutes' },
            { value: '60', label: '60 minutes' },
            { value: '90', label: '90 minutes' }
          ]}
          value={form.values.duration.toString()}
          onChange={(value) => form.setFieldValue('duration', parseInt(value || '60'))}
        />

        <Textarea
          label="Meeting Notes"
          placeholder="Add any notes or agenda items..."
          rows={3}
          {...form.getInputProps('notes')}
        />

        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Schedule Meeting
          </Button>
        </Group>
      </Stack>
    </form>
  );
}