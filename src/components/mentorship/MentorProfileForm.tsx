'use client';

import {
  Stack,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  Switch,
  Card,
  Title,
  Alert,
  Grid
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconUser, IconBriefcase } from '@tabler/icons-react';

interface MentorProfileFormProps {
  alumniId?: string;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function MentorProfileForm({
  alumniId,
  initialData,
  onSave,
  onCancel,
  loading = false
}: MentorProfileFormProps) {
  const form = useForm({
    initialValues: {
      alumniId: alumniId || initialData?.alumniId || '',
      specializations: initialData?.specializations || [],
      industries: initialData?.industries || [],
      yearsOfExperience: initialData?.yearsOfExperience || 0,
      maxMentees: initialData?.maxMentees || 2,
      availability: initialData?.availability || 'Available',
      preferredMeetingFrequency: initialData?.preferredMeetingFrequency || 'Bi-weekly',
      communicationPreference: initialData?.communicationPreference || 'Video calls',
      bio: initialData?.bio || '',
      isActive: initialData?.isActive ?? true,
      mentorshipAreas: initialData?.mentorshipAreas || [],
      timeZone: initialData?.timeZone || '',
      linkedinProfile: initialData?.linkedinProfile || '',
      personalWebsite: initialData?.personalWebsite || ''
    },
    validate: {
      specializations: (value) => 
        value.length === 0 ? 'At least one specialization is required' : null,
      industries: (value) => 
        value.length === 0 ? 'At least one industry is required' : null,
      yearsOfExperience: (value) => 
        value < 0 ? 'Years of experience cannot be negative' : null,
      maxMentees: (value) => 
        value < 1 ? 'Must be able to mentor at least 1 mentee' : null,
      bio: (value) => 
        value.length < 50 ? 'Bio must be at least 50 characters' : null
    }
  });

  const specializationOptions = [
    'Software Engineering',
    'Data Science',
    'Product Management',
    'Marketing',
    'Business Strategy',
    'Consulting',
    'Finance',
    'Sales',
    'Design',
    'Engineering',
    'Healthcare',
    'Education',
    'Entrepreneurship',
    'Leadership Development',
    'Career Transition',
    'Technical Leadership',
    'Project Management',
    'Digital Marketing',
    'Content Strategy',
    'Operations',
    'Human Resources',
    'Legal',
    'Research & Development'
  ];

  const industryOptions = [
    'Technology',
    'Healthcare',
    'Finance',
    'Consulting',
    'Education',
    'Manufacturing',
    'Retail',
    'Media',
    'Non-profit',
    'Government',
    'Startups',
    'SaaS',
    'E-commerce',
    'Automotive',
    'Clean Energy',
    'Biotechnology',
    'Real Estate',
    'Entertainment',
    'Travel & Hospitality',
    'Agriculture',
    'Telecommunications',
    'Aerospace'
  ];

  const mentorshipAreaOptions = [
    'Career Development',
    'Technical Skills',
    'Leadership Skills',
    'Interview Preparation',
    'Networking',
    'Work-Life Balance',
    'Salary Negotiation',
    'Industry Insights',
    'Skill Development',
    'Personal Branding',
    'Goal Setting',
    'Professional Growth'
  ];

  const handleSubmit = (values: typeof form.values) => {
    onSave(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          Create a comprehensive mentor profile to help match you with suitable mentees.
          Your profile will be visible to administrators and potential mentees.
        </Alert>

        {/* Basic Information */}
        <Card withBorder>
          <Group mb="md">
            <IconUser size={20} />
            <Title order={4}>Basic Information</Title>
          </Group>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MultiSelect
                label="Specializations"
                placeholder="Select your areas of expertise"
                data={specializationOptions}
                searchable
                required
                {...form.getInputProps('specializations')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MultiSelect
                label="Industries"
                placeholder="Select industries you have experience in"
                data={industryOptions}
                searchable
                required
                {...form.getInputProps('industries')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Years of Experience"
                placeholder="Enter your years of professional experience"
                min={0}
                max={50}
                required
                {...form.getInputProps('yearsOfExperience')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Maximum Mentees"
                placeholder="How many mentees can you handle?"
                min={1}
                max={10}
                required
                {...form.getInputProps('maxMentees')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Mentorship Preferences */}
        <Card withBorder>
          <Group mb="md">
            <IconBriefcase size={20} />
            <Title order={4}>Mentorship Preferences</Title>
          </Group>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Availability"
                data={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Limited', label: 'Limited' },
                  { value: 'Unavailable', label: 'Unavailable' }
                ]}
                required
                {...form.getInputProps('availability')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Preferred Meeting Frequency"
                data={[
                  { value: 'Weekly', label: 'Weekly' },
                  { value: 'Bi-weekly', label: 'Bi-weekly' },
                  { value: 'Monthly', label: 'Monthly' },
                  { value: 'As needed', label: 'As needed' }
                ]}
                required
                {...form.getInputProps('preferredMeetingFrequency')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Communication Preference"
                data={[
                  { value: 'Video calls', label: 'Video calls' },
                  { value: 'Phone calls', label: 'Phone calls' },
                  { value: 'Video calls + messaging', label: 'Video calls + messaging' },
                  { value: 'Email only', label: 'Email only' },
                  { value: 'In-person meetings', label: 'In-person meetings' }
                ]}
                required
                {...form.getInputProps('communicationPreference')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Time Zone"
                placeholder="e.g., EST, PST, GMT+1"
                {...form.getInputProps('timeZone')}
              />
            </Grid.Col>
            
            <Grid.Col span={12}>
              <MultiSelect
                label="Mentorship Areas"
                placeholder="What areas can you help mentees with?"
                data={mentorshipAreaOptions}
                searchable
                {...form.getInputProps('mentorshipAreas')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Profile Details */}
        <Card withBorder>
          <Title order={4} mb="md">Profile Details</Title>
          
          <Stack gap="md">
            <Textarea
              label="Bio"
              placeholder="Tell potential mentees about yourself, your experience, and what you can offer as a mentor..."
              rows={4}
              required
              {...form.getInputProps('bio')}
            />
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="LinkedIn Profile"
                  placeholder="https://linkedin.com/in/yourprofile"
                  {...form.getInputProps('linkedinProfile')}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Personal Website"
                  placeholder="https://yourwebsite.com"
                  {...form.getInputProps('personalWebsite')}
                />
              </Grid.Col>
            </Grid>
            
            <Switch
              label="Active Mentor"
              description="Make your profile visible to potential mentees"
              {...form.getInputProps('isActive', { type: 'checkbox' })}
            />
          </Stack>
        </Card>

        {/* Actions */}
        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Profile' : 'Create Profile'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}