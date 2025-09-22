'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Title,
  Divider,
  Avatar,
  ActionIcon,
  Tooltip,
  Paper,
  Loader,
  Center,
  Alert,
  Anchor,
  Box,
  Image,
  Modal,
  Tabs
} from '@mantine/core';
import {
  IconUser,
  IconBriefcase,
  IconMapPin,
  IconSchool,
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconWorld,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconCalendar,
  IconBuilding,
  IconStar,
  IconMessage,
  IconShare,
  IconArrowLeft,
  IconAlertCircle
} from '@tabler/icons-react';
import { AlumniProfile as AlumniProfileType } from '@/types';
import { mockAlumniService } from '@/lib/mock-services/alumniService';

interface AlumniProfileProps {
  alumniId: string;
  onBack?: () => void;
  onEdit?: (alumni: AlumniProfileType) => void;
}

export function AlumniProfile({ alumniId, onBack, onEdit }: AlumniProfileProps) {
  const [alumni, setAlumni] = useState<AlumniProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Load alumni profile
  useEffect(() => {
    const loadAlumni = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await mockAlumniService.getAlumniById(alumniId);
        setAlumni(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alumni profile');
      } finally {
        setLoading(false);
      }
    };

    if (alumniId) {
      loadAlumni();
    }
  }, [alumniId]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      </Center>
    );
  }

  if (!alumni) {
    return (
      <Center py="xl">
        <Text>Alumni profile not found</Text>
      </Center>
    );
  }

  return (
    <Container size="lg" py="md">
      {/* Header with Back Button */}
      {onBack && (
        <Group mb="lg">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Back to Directory
          </Button>
        </Group>
      )}

      <Grid>
        {/* Left Column - Profile Info */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack align="center" gap="md">
              {/* Profile Image */}
              <Box pos="relative">
                <Avatar
                  src={alumni.profileImage}
                  alt={`${alumni.firstName} ${alumni.lastName}`}
                  size={120}
                  radius="md"
                  style={{ cursor: alumni.profileImage ? 'pointer' : 'default' }}
                  onClick={() => alumni.profileImage && setImageModalOpen(true)}
                />
                {!alumni.isPublic && (
                  <Tooltip label="Private Profile">
                    <ActionIcon
                      size="sm"
                      variant="filled"
                      color="gray"
                      pos="absolute"
                      top={0}
                      right={0}
                    >
                      <IconEyeOff size={12} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Box>

              {/* Name and Basic Info */}
              <Stack align="center" gap="xs">
                <Title order={2} ta="center">
                  {alumni.firstName} {alumni.lastName}
                </Title>
                <Text size="lg" c="dimmed" ta="center">
                  Class of {alumni.graduationYear}
                </Text>
                <Badge variant="light" size="lg">
                  {alumni.degree}
                </Badge>
              </Stack>

              {/* Current Position */}
              {alumni.currentCompany && alumni.currentPosition && (
                <Stack align="center" gap="xs">
                  <Group gap="xs">
                    <IconBriefcase size={16} color="gray" />
                    <Text size="sm" fw={500} ta="center">
                      {alumni.currentPosition}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconBuilding size={16} color="gray" />
                    <Text size="sm" c="dimmed" ta="center">
                      {alumni.currentCompany}
                    </Text>
                  </Group>
                </Stack>
              )}

              {/* Location */}
              {alumni.location && (
                <Group gap="xs">
                  <IconMapPin size={16} color="gray" />
                  <Text size="sm" ta="center">{alumni.location}</Text>
                </Group>
              )}

              <Divider w="100%" />

              {/* Contact Actions */}
              <Group justify="center" gap="xs">
                {alumni.phone && (
                  <Tooltip label="Call">
                    <ActionIcon
                      variant="light"
                      size="lg"
                      component="a"
                      href={`tel:${alumni.phone}`}
                    >
                      <IconPhone size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Email">
                  <ActionIcon
                    variant="light"
                    size="lg"
                    component="a"
                    href={`mailto:${alumni.firstName.toLowerCase()}.${alumni.lastName.toLowerCase()}@example.com`}
                  >
                    <IconMail size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Message">
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={() => {/* TODO: Implement messaging */}}
                  >
                    <IconMessage size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              {/* Social Links */}
              {(alumni.linkedinUrl || alumni.websiteUrl) && (
                <>
                  <Divider w="100%" />
                  <Group justify="center" gap="xs">
                    {alumni.linkedinUrl && (
                      <Tooltip label="LinkedIn Profile">
                        <ActionIcon
                          variant="light"
                          size="lg"
                          component="a"
                          href={alumni.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <IconBrandLinkedin size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {alumni.websiteUrl && (
                      <Tooltip label="Personal Website">
                        <ActionIcon
                          variant="light"
                          size="lg"
                          component="a"
                          href={alumni.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <IconWorld size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </>
              )}

              {/* Action Buttons */}
              <Stack w="100%" gap="xs">
                {onEdit && (
                  <Button
                    variant="light"
                    leftSection={<IconEdit size={16} />}
                    onClick={() => onEdit(alumni)}
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="subtle"
                  leftSection={<IconShare size={16} />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // TODO: Show success notification
                  }}
                  fullWidth
                >
                  Share Profile
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Right Column - Detailed Information */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Tabs defaultValue="about" variant="outline">
            <Tabs.List>
              <Tabs.Tab value="about" leftSection={<IconUser size={16} />}>
                About
              </Tabs.Tab>
              <Tabs.Tab value="experience" leftSection={<IconBriefcase size={16} />}>
                Experience
              </Tabs.Tab>
              <Tabs.Tab value="skills" leftSection={<IconStar size={16} />}>
                Skills & Interests
              </Tabs.Tab>
            </Tabs.List>

            {/* About Tab */}
            <Tabs.Panel value="about" pt="md">
              <Stack gap="md">
                {/* Bio */}
                {alumni.bio && (
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                      <Title order={4}>About</Title>
                      <Text>{alumni.bio}</Text>
                    </Stack>
                  </Card>
                )}

                {/* Education */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="sm">
                    <Title order={4}>Education</Title>
                    <Group gap="md">
                      <IconSchool size={20} color="gray" />
                      <div>
                        <Text fw={500}>{alumni.degree}</Text>
                        <Text size="sm" c="dimmed">
                          Graduated in {alumni.graduationYear}
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>

                {/* Contact Information */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="sm">
                    <Title order={4}>Contact Information</Title>
                    <Stack gap="xs">
                      <Group gap="md">
                        <IconMail size={16} color="gray" />
                        <Anchor
                          href={`mailto:${alumni.firstName.toLowerCase()}.${alumni.lastName.toLowerCase()}@example.com`}
                          size="sm"
                        >
                          {alumni.firstName.toLowerCase()}.{alumni.lastName.toLowerCase()}@example.com
                        </Anchor>
                      </Group>
                      {alumni.phone && (
                        <Group gap="md">
                          <IconPhone size={16} color="gray" />
                          <Anchor href={`tel:${alumni.phone}`} size="sm">
                            {alumni.phone}
                          </Anchor>
                        </Group>
                      )}
                      {alumni.location && (
                        <Group gap="md">
                          <IconMapPin size={16} color="gray" />
                          <Text size="sm">{alumni.location}</Text>
                        </Group>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Tabs.Panel>

            {/* Experience Tab */}
            <Tabs.Panel value="experience" pt="md">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Current Position</Title>
                  {alumni.currentCompany && alumni.currentPosition ? (
                    <Group gap="md">
                      <IconBriefcase size={20} color="gray" />
                      <div>
                        <Text fw={500}>{alumni.currentPosition}</Text>
                        <Text size="sm" c="dimmed">{alumni.currentCompany}</Text>
                        <Text size="xs" c="dimmed">
                          {alumni.location && `Located in ${alumni.location}`}
                        </Text>
                      </div>
                    </Group>
                  ) : (
                    <Text c="dimmed" size="sm">
                      No current position information available
                    </Text>
                  )}
                </Stack>
              </Card>
            </Tabs.Panel>

            {/* Skills & Interests Tab */}
            <Tabs.Panel value="skills" pt="md">
              <Stack gap="md">
                {/* Skills */}
                {alumni.skills.length > 0 && (
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                      <Title order={4}>Skills</Title>
                      <Group gap="xs">
                        {alumni.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="light"
                            size="md"
                            radius="md"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>
                  </Card>
                )}

                {/* Interests */}
                {alumni.interests.length > 0 && (
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="sm">
                      <Title order={4}>Interests</Title>
                      <Group gap="xs">
                        {alumni.interests.map((interest) => (
                          <Badge
                            key={interest}
                            variant="outline"
                            size="md"
                            radius="md"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>
                  </Card>
                )}

                {alumni.skills.length === 0 && alumni.interests.length === 0 && (
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text c="dimmed" size="sm" ta="center">
                      No skills or interests information available
                    </Text>
                  </Card>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>

      {/* Profile Image Modal */}
      <Modal
        opened={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title={`${alumni.firstName} ${alumni.lastName}`}
        size="lg"
        centered
      >
        {alumni.profileImage && (
          <Image
            src={alumni.profileImage}
            alt={`${alumni.firstName} ${alumni.lastName}`}
            radius="md"
          />
        )}
      </Modal>
    </Container>
  );
}

// Compact Alumni Profile Card Component for use in lists
interface AlumniProfileCardProps {
  alumni: AlumniProfileType;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onMessage?: () => void;
}

export function AlumniProfileCard({ 
  alumni, 
  onClick, 
  showActions = false,
  onEdit,
  onMessage 
}: AlumniProfileCardProps) {
  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Group justify="space-between" align="flex-start">
        <Group gap="md" style={{ flex: 1 }}>
          <Avatar
            src={alumni.profileImage}
            alt={`${alumni.firstName} ${alumni.lastName}`}
            size="lg"
            radius="md"
          />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={600} size="lg">
                  {alumni.firstName} {alumni.lastName}
                </Text>
                <Text size="sm" c="dimmed">
                  Class of {alumni.graduationYear} • {alumni.degree}
                </Text>
              </div>
              {!alumni.isPublic && (
                <Tooltip label="Private Profile">
                  <IconEyeOff size={16} color="gray" />
                </Tooltip>
              )}
            </Group>

            {alumni.currentCompany && alumni.currentPosition && (
              <Group gap="xs">
                <IconBriefcase size={14} color="gray" />
                <Text size="sm">
                  {alumni.currentPosition} at {alumni.currentCompany}
                </Text>
              </Group>
            )}

            {alumni.location && (
              <Group gap="xs">
                <IconMapPin size={14} color="gray" />
                <Text size="sm">{alumni.location}</Text>
              </Group>
            )}

            {alumni.skills.length > 0 && (
              <Group gap="xs">
                {alumni.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="light" size="sm">
                    {skill}
                  </Badge>
                ))}
                {alumni.skills.length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{alumni.skills.length - 3} more
                  </Badge>
                )}
              </Group>
            )}
          </Stack>
        </Group>

        {showActions && (
          <Group gap="xs">
            {onMessage && (
              <Tooltip label="Send Message">
                <ActionIcon
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessage();
                  }}
                >
                  <IconMessage size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip label="Edit Profile">
                <ActionIcon
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        )}
      </Group>
    </Card>
  );
}