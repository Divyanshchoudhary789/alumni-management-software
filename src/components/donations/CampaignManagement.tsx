'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Grid,
  Text,
  Progress,
  Group,
  Badge,
  Button,
  ActionIcon,
  Menu,
  Stack,
  Skeleton,
  Alert,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
} from '@mantine/core';
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconTarget,
  IconCalendar,
  IconTrendingUp,
  IconUsers,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { mockDonationService } from '@/lib/mock-services';

interface CampaignManagementProps {
  showAddButton?: boolean;
}

export function CampaignManagement({ showAddButton = true }: CampaignManagementProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpened, setFormOpened] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<any>(null);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      goal: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
    validate: {
      name: (value) => (!value ? 'Campaign name is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      goal: (value) => {
        if (!value || value <= 0) return 'Goal must be greater than 0';
        if (value > 10000000) return 'Goal cannot exceed $10,000,000';
        return null;
      },
      endDate: (value, values) => {
        if (value <= values.startDate) return 'End date must be after start date';
        return null;
      },
    },
  });

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await mockDonationService.getCampaigns();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load campaigns',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'paused': return 'yellow';
      case 'ended': return 'gray';
      default: return 'gray';
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    form.setValues({
      name: campaign.name,
      description: campaign.description,
      goal: campaign.goal,
      startDate: new Date(campaign.startDate),
      endDate: new Date(campaign.endDate),
    });
    setFormOpened(true);
  };

  const handleDelete = (campaign: any) => {
    setCampaignToDelete(campaign);
    setDeleteModalOpened(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Mock campaign creation/update
      notifications.show({
        title: 'Success',
        message: editingCampaign ? 'Campaign updated successfully' : 'Campaign created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      form.reset();
      setFormOpened(false);
      setEditingCampaign(null);
      loadCampaigns();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save campaign',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const confirmDelete = async () => {
    try {
      // Mock delete operation
      notifications.show({
        title: 'Success',
        message: 'Campaign deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      setDeleteModalOpened(false);
      setCampaignToDelete(null);
      loadCampaigns();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete campaign',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  if (loading) {
    return (
      <Card padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">Campaign Management</Title>
        <Grid>
          {[...Array(3)].map((_, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
              <Skeleton height={200} />
            </Grid.Col>
          ))}
        </Grid>
      </Card>
    );
  }

  return (
    <>
      <Card padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Campaign Management</Title>
          {showAddButton && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setFormOpened(true)}
            >
              Create Campaign
            </Button>
          )}
        </Group>

        {campaigns.length > 0 ? (
          <Grid>
            {campaigns.map((campaign) => {
              const progressPercentage = (campaign.raised / campaign.goal) * 100;
              const daysRemaining = getDaysRemaining(campaign.endDate);
              
              return (
                <Grid.Col key={campaign.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card padding="md" radius="sm" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Badge 
                        color={getStatusColor(campaign.status)} 
                        size="sm"
                        variant="light"
                      >
                        {campaign.status}
                      </Badge>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => {/* View details */}}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => handleEdit(campaign)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDelete(campaign)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Title order={4} mb="xs" lineClamp={2}>
                      {campaign.name}
                    </Title>

                    <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                      {campaign.description}
                    </Text>

                    <Progress 
                      value={progressPercentage} 
                      size="lg" 
                      radius="sm"
                      mb="xs"
                      color={progressPercentage >= 100 ? 'green' : progressPercentage >= 75 ? 'blue' : 'orange'}
                    />

                    <Group justify="space-between" mb="md">
                      <Text size="sm" fw={500}>
                        {formatCurrency(campaign.raised)}
                      </Text>
                      <Text size="sm" c="dimmed">
                        of {formatCurrency(campaign.goal)}
                      </Text>
                    </Group>

                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <IconTarget size={14} />
                          <Text size="xs" c="dimmed">
                            {progressPercentage.toFixed(1)}% complete
                          </Text>
                        </Group>
                        
                        {daysRemaining > 0 ? (
                          <Group gap="xs">
                            <IconCalendar size={14} />
                            <Text size="xs" c="dimmed">
                              {daysRemaining} days left
                            </Text>
                          </Group>
                        ) : (
                          <Group gap="xs">
                            <IconCalendar size={14} />
                            <Text size="xs" c="red">
                              Ended
                            </Text>
                          </Group>
                        )}
                      </Group>

                      {progressPercentage >= 90 && (
                        <Group gap="xs">
                          <IconTrendingUp size={14} color="green" />
                          <Text size="xs" c="green" fw={500}>
                            Nearly reached goal!
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        ) : (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text>No campaigns found. Create your first campaign to start fundraising.</Text>
          </Alert>
        )}
      </Card>

      {/* Campaign Form Modal */}
      <Modal
        opened={formOpened}
        onClose={() => {
          setFormOpened(false);
          setEditingCampaign(null);
          form.reset();
        }}
        title={editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Campaign Name"
              placeholder="Enter campaign name"
              required
              {...form.getInputProps('name')}
            />

            <Textarea
              label="Description"
              placeholder="Describe the campaign purpose and goals"
              rows={4}
              required
              {...form.getInputProps('description')}
            />

            <NumberInput
              label="Fundraising Goal"
              placeholder="Enter target amount"
              prefix="$"
              min={1}
              max={10000000}
              required
              {...form.getInputProps('goal')}
            />

            <DateInput
              label="Start Date"
              placeholder="Select start date"
              required
              {...form.getInputProps('startDate')}
            />

            <DateInput
              label="End Date"
              placeholder="Select end date"
              required
              {...form.getInputProps('endDate')}
            />

            <Group justify="flex-end">
              <Button 
                variant="light" 
                onClick={() => {
                  setFormOpened(false);
                  setEditingCampaign(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this campaign? This action cannot be undone and will affect all associated donations.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteModalOpened(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}