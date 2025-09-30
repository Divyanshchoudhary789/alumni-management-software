'use client';

import { useState, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Divider,
  Avatar,
  FileInput,
  Switch,
  Alert,
  Paper,
  ActionIcon,
  Image,
  Modal,
  Progress,
  Notification
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconSchool,
  IconBriefcase,
  IconUpload,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
  IconPhoto,
  IconTrash,
  IconEdit,
  IconDeviceFloppy,
  IconArrowLeft
} from '@tabler/icons-react';
import { AlumniProfile } from '@/types';
import { alumniApiService } from '@/services/api/alumniService';

interface AlumniFormProps {
  alumni?: AlumniProfile; // If provided, form is in edit mode
  onSubmit?: (alumni: AlumniProfile) => void;
  onCancel?: () => void;
  onBack?: () => void;
}

interface AlumniFormData {
  firstName: string;
  lastName: string;
  graduationYear: number;
  degree: string;
  currentCompany: string;
  currentPosition: string;
  location: string;
  bio: string;
  phone: string;
  linkedinUrl: string;
  websiteUrl: string;
  isPublic: boolean;
  skills: string[];
  interests: string[];
  profileImage?: File | string;
}

export function AlumniForm({ alumni, onSubmit, onCancel, onBack }: AlumniFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    alumni?.profileImage || null
  );
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!alumni;
  const currentYear = new Date().getFullYear();

  // Form validation and state management
  const form = useForm<AlumniFormData>({
    initialValues: {
      firstName: alumni?.firstName || '',
      lastName: alumni?.lastName || '',
      graduationYear: alumni?.graduationYear || currentYear,
      degree: alumni?.degree || '',
      currentCompany: alumni?.currentCompany || '',
      currentPosition: alumni?.currentPosition || '',
      location: alumni?.location || '',
      bio: alumni?.bio || '',
      phone: alumni?.phone || '',
      linkedinUrl: alumni?.linkedinUrl || '',
      websiteUrl: alumni?.websiteUrl || '',
      isPublic: alumni?.isPublic ?? true,
      skills: alumni?.skills || [],
      interests: alumni?.interests || [],
      profileImage: alumni?.profileImage
    },
    validate: {
      firstName: (value) => 
        value.length < 2 ? 'First name must be at least 2 characters' : null,
      lastName: (value) => 
        value.length < 2 ? 'Last name must be at least 2 characters' : null,
      graduationYear: (value) => {
        if (value < 1950) return 'Graduation year must be after 1950';
        if (value > currentYear + 10) return 'Graduation year cannot be more than 10 years in the future';
        return null;
      },
      degree: (value) => 
        value.length < 2 ? 'Degree is required' : null,
      phone: (value) => {
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return null;
      },
      linkedinUrl: (value) => {
        if (value && !value.includes('linkedin.com')) {
          return 'Please enter a valid LinkedIn URL';
        }
        return null;
      },
      websiteUrl: (value) => {
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          return 'Please enter a valid website URL';
        }
        return null;
      },
      bio: (value) => {
        if (value && value.length > 500) {
          return 'Bio must be less than 500 characters';
        }
        return null;
      }
    }
  });

  // Handle image upload
  const handleImageUpload = (file: File | null) => {
    if (!file) {
      setImagePreview(null);
      form.setFieldValue('profileImage', undefined);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notifications.show({
        title: 'Invalid file type',
        message: 'Please select an image file',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: 'File too large',
        message: 'Image must be less than 5MB',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    form.setFieldValue('profileImage', file);

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Handle form submission
  const handleSubmit = async (values: AlumniFormData) => {
    try {
      setLoading(true);

      // Simulate API call
      if (isEditMode && alumni) {
        const updatedAlumni = {
          ...alumni,
          ...values,
          profileImage: typeof values.profileImage === 'string' ? values.profileImage : alumni.profileImage,
          updatedAt: new Date()
        };
        await alumniApiService.updateAlumni(alumni.id, updatedAlumni);
        
        notifications.show({
          title: 'Profile updated',
          message: 'Alumni profile has been updated successfully',
          color: 'green',
          icon: <IconCheck size={16} />
        });

        onSubmit?.(updatedAlumni);
      } else {
        const newAlumni = await alumniApiService.createAlumni({
          ...values,
          profileImage: typeof values.profileImage === 'string' ? values.profileImage : undefined,
          userId: `user_${Date.now()}` // Mock user ID
        });
        
        notifications.show({
          title: 'Profile created',
          message: 'Alumni profile has been created successfully',
          color: 'green',
          icon: <IconCheck size={16} />
        });

        onSubmit?.(newAlumni.data);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save profile',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  // Predefined options
  const degreeOptions = [
    'Computer Science',
    'Business Administration',
    'Engineering',
    'Marketing',
    'Data Science',
    'Psychology',
    'Economics',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'English',
    'History',
    'Art',
    'Music',
    'Other'
  ];

  const skillOptions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
    'Kubernetes', 'Analytics', 'Leadership', 'Strategy', 'Design', 'Marketing',
    'Sales', 'Project Management', 'Communication', 'Problem Solving'
  ];

  const interestOptions = [
    'Web Development', 'Machine Learning', 'Data Science', 'Mobile Development',
    'Cloud Computing', 'Cybersecurity', 'Blockchain', 'AI/ML', 'IoT',
    'Business Strategy', 'Entrepreneurship', 'Startups', 'Finance',
    'Marketing', 'Design', 'Photography', 'Travel', 'Sports', 'Music',
    'Reading', 'Cooking', 'Fitness', 'Volunteering', 'Mentoring'
  ];

  return (
    <Container size="lg" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Group gap="md">
            {onBack && (
              <ActionIcon
                variant="subtle"
                onClick={onBack}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            )}
            <div>
              <Title order={2}>
                {isEditMode ? 'Edit Alumni Profile' : 'Add New Alumni'}
              </Title>
              <Text c="dimmed" size="sm">
                {isEditMode 
                  ? 'Update alumni information and settings'
                  : 'Create a new alumni profile with complete information'
                }
              </Text>
            </div>
          </Group>
        </div>
      </Group>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          {/* Left Column - Profile Image and Privacy */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Profile Image Upload */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack align="center" gap="md">
                  <Title order={4}>Profile Photo</Title>
                  
                  <div style={{ position: 'relative' }}>
                    <Avatar
                      src={imagePreview}
                      alt="Profile preview"
                      size={120}
                      radius="md"
                      style={{ cursor: imagePreview ? 'pointer' : 'default' }}
                      onClick={() => imagePreview && setImageModalOpen(true)}
                    />
                    {imagePreview && (
                      <ActionIcon
                        size="sm"
                        variant="filled"
                        color="red"
                        pos="absolute"
                        top={-5}
                        right={-5}
                        onClick={() => {
                          setImagePreview(null);
                          form.setFieldValue('profileImage', undefined);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    )}
                  </div>

                  <FileInput
                    ref={fileInputRef}
                    placeholder="Choose image"
                    accept="image/*"
                    leftSection={<IconUpload size={16} />}
                    onChange={handleImageUpload}
                    style={{ width: '100%' }}
                  />

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <Progress value={uploadProgress} size="sm" style={{ width: '100%' }} />
                  )}

                  <Text size="xs" c="dimmed" ta="center">
                    Upload a profile photo (max 5MB)
                    <br />
                    Supported formats: JPG, PNG, GIF
                  </Text>
                </Stack>
              </Card>

              {/* Privacy Settings */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Privacy Settings</Title>
                  
                  <Switch
                    label="Public Profile"
                    description="Allow other alumni to view your profile"
                    {...form.getInputProps('isPublic', { type: 'checkbox' })}
                    thumbIcon={
                      form.values.isPublic ? (
                        <IconEye size={12} />
                      ) : (
                        <IconEyeOff size={12} />
                      )
                    }
                  />

                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    color={form.values.isPublic ? 'blue' : 'yellow'}
                    variant="light"
                  >
                    {form.values.isPublic
                      ? 'Your profile will be visible to other alumni and administrators'
                      : 'Your profile will only be visible to administrators'
                    }
                  </Alert>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          {/* Right Column - Form Fields */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              {/* Basic Information */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Basic Information</Title>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="First Name"
                        placeholder="Enter first name"
                        required
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('firstName')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Last Name"
                        placeholder="Enter last name"
                        required
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('lastName')}
                      />
                    </Grid.Col>
                  </Grid>

                  <Textarea
                    label="Bio"
                    placeholder="Tell us about yourself..."
                    description={`${form.values.bio.length}/500 characters`}
                    minRows={3}
                    maxRows={6}
                    {...form.getInputProps('bio')}
                  />
                </Stack>
              </Card>

              {/* Education */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Education</Title>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label="Graduation Year"
                        placeholder="e.g. 2020"
                        required
                        min={1950}
                        max={currentYear + 10}
                        leftSection={<IconSchool size={16} />}
                        {...form.getInputProps('graduationYear')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Degree"
                        placeholder="Select degree"
                        required
                        data={degreeOptions}
                        searchable
                        leftSection={<IconSchool size={16} />}
                        {...form.getInputProps('degree')}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>

              {/* Professional Information */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Professional Information</Title>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Current Company"
                        placeholder="e.g. Google, Microsoft"
                        leftSection={<IconBriefcase size={16} />}
                        {...form.getInputProps('currentCompany')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Current Position"
                        placeholder="e.g. Software Engineer"
                        leftSection={<IconBriefcase size={16} />}
                        {...form.getInputProps('currentPosition')}
                      />
                    </Grid.Col>
                  </Grid>

                  <TextInput
                    label="Location"
                    placeholder="e.g. San Francisco, CA"
                    leftSection={<IconMapPin size={16} />}
                    {...form.getInputProps('location')}
                  />
                </Stack>
              </Card>

              {/* Contact Information */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Contact Information</Title>
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        leftSection={<IconPhone size={16} />}
                        {...form.getInputProps('phone')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="LinkedIn URL"
                        placeholder="https://linkedin.com/in/username"
                        leftSection={<IconBriefcase size={16} />}
                        {...form.getInputProps('linkedinUrl')}
                      />
                    </Grid.Col>
                  </Grid>

                  <TextInput
                    label="Personal Website"
                    placeholder="https://yourwebsite.com"
                    leftSection={<IconMail size={16} />}
                    {...form.getInputProps('websiteUrl')}
                  />
                </Stack>
              </Card>

              {/* Skills and Interests */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Skills & Interests</Title>
                  
                  <MultiSelect
                    label="Skills"
                    placeholder="Select or add your skills"
                    data={skillOptions}
                    searchable
                    {...form.getInputProps('skills')}
                  />

                  <MultiSelect
                    label="Interests"
                    placeholder="Select or add your interests"
                    data={interestOptions}
                    searchable
                    {...form.getInputProps('interests')}
                  />
                </Stack>
              </Card>

              {/* Form Actions */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <Button
                    variant="subtle"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  
                  <Group>
                    <Button
                      type="submit"
                      loading={loading}
                      leftSection={<IconDeviceFloppy size={16} />}
                    >
                      {isEditMode ? 'Update Profile' : 'Create Profile'}
                    </Button>
                  </Group>
                </Group>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </form>

      {/* Image Preview Modal */}
      <Modal
        opened={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Profile Photo Preview"
        size="lg"
        centered
      >
        {imagePreview && (
          <Image
            src={imagePreview}
            alt="Profile photo preview"
            radius="md"
          />
        )}
      </Modal>
    </Container>
  );
}