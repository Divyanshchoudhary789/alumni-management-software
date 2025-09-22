'use client';

import {
  Stack,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Card,
  Title,
  Alert,
  Grid,
  Switch
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconUser, IconTarget, IconClock } from '@tabler/icons-react';

interface MenteeProfileFormProps {
  alumniId?: string;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function MenteeProfileForm({
  alumniId,
  initialData,
  onSave,
  onCancel,
  loading = false
}: MenteeProfileFormProps) {
  const form = useForm({
    initialValues: {
      alumniId: alumniId || initialData?.alumniId || '',
      requestedSpecializations: initialData?.requestedSpecializations || [],
      careerGoals: initialData?.careerGoals || '',
      currentSituation: initialData?.currentSituation || '',
      preferredMentorIndustries: initialData?.preferredMentorIndustries || [],
      timeCommitment: initialData?.timeCommitment || 'Bi-weekly meetings',
      communicationPreference: initialData?.communicationPreference || 'Video calls',
      specificChallenges: initialData?.specificChallenges || [],
      desiredOutcomes: initialData?.desiredOutcomes || [],
      timeZone: initialData?.timeZone || '',
      availabilityDays: initialData?.availabilityDays || [],
      availabilityTimes: initialData?.availabilityTimes || [],
      mentorshipDuration: initialData?.mentorshipDuration || '6 months',
      previousMentorshipExperience: initialData?.previousMentorshipExperience || false,
      additionalNotes: initialData?.additionalNotes || ''
    },
    validate: {
      requestedSpecializations: (value) => 
        value.length === 0 ? 'At least one specialization is required' : null,
      careerGoals: (value) => 
        value.length < 20 ? 'Please provide more detailed career goals (at least 20 characters)' : null,
      currentSituation: (value) => 
        value.length < 20 ? 'Please provide more details about your current situation (at least 20 characters)' : null,
      preferredMentorIndustries: (value) => 
        value.length === 0 ? 'At least one preferred industry is required' : null
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

  const challengeOptions = [
    'Career Direction',
    'Skill Development',
    'Interview Preparation',
    'Networking',
    'Work-Life Balance',
    'Salary Negotiation',
    'Leadership Skills',
    'Technical Skills',
    'Industry Knowledge',
    'Personal Branding',
    'Goal Setting',
    'Confidence Building',
    'Communication Skills',
    'Time Management'
  ];

  const outcomeOptions = [
    'Career Advancement',
    'Skill Improvement',
    'Industry Insights',
    'Network Expansion',
    'Confidence Building',
    'Goal Achievement',
    'Better Work-Life Balance',
    'Leadership Development',
    'Technical Expertise',
    'Strategic Thinking',
    'Problem-Solving Skills',
    'Communication Skills'
  ];

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const timeOptions = [
    { value: 'morning', label: 'Morning (6AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
    { value: 'evening', label: 'Evening (6PM - 10PM)' }
  ];

  const handleSubmit = (values: typeof form.values) => {
    onSave(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          Create your mentee profile to help us match you with the right mentor.
          Be specific about your goals and what you're looking for in a mentorship.
        </Alert>

        {/* Career Goals & Current Situation */}
        <Card withBorder>
          <Group mb="md">
            <IconTarget size={20} />
            <Title order={4}>Career Goals & Current Situation</Title>
          </Group>
          
          <Stack gap="md">
            <MultiSelect
              label="Requested Specializations"
              placeholder="What areas do you want mentorship in?"
              data={specializationOptions}
              searchable
              required
              {...form.getInputProps('requestedSpecializations')}
            />
            
            <Textarea
              label="Career Goals"
              placeholder="Describe your career goals and what you want to achieve through mentorship..."
              rows={3}
              required
              {...form.getInputProps('careerGoals')}
            />
            
            <Textarea
              label="Current Situation"
              placeholder="Tell us about your current role, experience level, and challenges you're facing..."
              rows={3}
              required
              {...form.getInputProps('currentSituation')}
            />
            
            <MultiSelect
              label="Preferred Mentor Industries"
              placeholder="Which industries would you like your mentor to have experience in?"
              data={industryOptions}
              searchable
              required
              {...form.getInputProps('preferredMentorIndustries')}
            />
          </Stack>
        </Card>

        {/* Mentorship Preferences */}
        <Card withBorder>
          <Group mb="md">
            <IconClock size={20} />
            <Title order={4}>Mentorship Preferences</Title>
          </Group>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Time Commitment"
                data={[
                  { value: 'Weekly meetings', label: 'Weekly meetings' },
                  { value: 'Bi-weekly meetings', label: 'Bi-weekly meetings' },
                  { value: 'Monthly meetings', label: 'Monthly meetings' },
                  { value: 'As needed', label: 'As needed' }
                ]}
                required
                {...form.getInputProps('timeCommitment')}
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
              <Select
                label="Preferred Mentorship Duration"
                data={[
                  { value: '3 months', label: '3 months' },
                  { value: '6 months', label: '6 months' },
                  { value: '1 year', label: '1 year' },
                  { value: 'Ongoing', label: 'Ongoing' }
                ]}
                {...form.getInputProps('mentorshipDuration')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Time Zone"
                placeholder="e.g., EST, PST, GMT+1"
                {...form.getInputProps('timeZone')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Availability */}
        <Card withBorder>
          <Title order={4} mb="md">Availability</Title>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MultiSelect
                label="Available Days"
                placeholder="Select days you're available for meetings"
                data={dayOptions}
                {...form.getInputProps('availabilityDays')}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MultiSelect
                label="Available Times"
                placeholder="Select preferred meeting times"
                data={timeOptions}
                {...form.getInputProps('availabilityTimes')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Specific Needs */}
        <Card withBorder>
          <Group mb="md">
            <IconUser size={20} />
            <Title order={4}>Specific Needs & Expectations</Title>
          </Group>
          
          <Stack gap="md">
            <MultiSelect
              label="Specific Challenges"
              placeholder="What specific challenges do you need help with?"
              data={challengeOptions}
              searchable
              {...form.getInputProps('specificChallenges')}
            />
            
            <MultiSelect
              label="Desired Outcomes"
              placeholder="What do you hope to achieve from this mentorship?"
              data={outcomeOptions}
              searchable
              {...form.getInputProps('desiredOutcomes')}
            />
            
            <Switch
              label="Previous Mentorship Experience"
              description="Have you been in a mentorship relationship before?"
              {...form.getInputProps('previousMentorshipExperience', { type: 'checkbox' })}
            />
            
            <Textarea
              label="Additional Notes"
              placeholder="Any additional information you'd like to share with potential mentors..."
              rows={3}
              {...form.getInputProps('additionalNotes')}
            />
          </Stack>
        </Card>

        {/* Actions */}
        <Group justify="flex-end">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Request' : 'Submit Request'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}