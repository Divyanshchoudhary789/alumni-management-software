'use client';

import { 
  Group, 
  Stack, 
  Text, 
  ActionIcon, 
  Tooltip, 
  Anchor, 
  Card,
  Title,
  Divider,
  Button,
  CopyButton
} from '@mantine/core';
import {
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconWorld,
  IconMapPin,
  IconCopy,
  IconCheck,
  IconMessage,
  IconShare
} from '@tabler/icons-react';
import { AlumniProfile } from '@/types';

interface AlumniContactInfoProps {
  alumni: AlumniProfile;
  variant?: 'full' | 'compact' | 'actions-only';
  showActions?: boolean;
  onMessage?: () => void;
  onShare?: () => void;
}

export function AlumniContactInfo({ 
  alumni, 
  variant = 'full',
  showActions = true,
  onMessage,
  onShare 
}: AlumniContactInfoProps) {
  const email = `${alumni.firstName.toLowerCase()}.${alumni.lastName.toLowerCase()}@example.com`;

  if (variant === 'actions-only') {
    return (
      <Group gap="xs">
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
            href={`mailto:${email}`}
          >
            <IconMail size={18} />
          </ActionIcon>
        </Tooltip>
        {onMessage && (
          <Tooltip label="Message">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={onMessage}
            >
              <IconMessage size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        {alumni.linkedinUrl && (
          <Tooltip label="LinkedIn">
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
          <Tooltip label="Website">
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
        {onShare && (
          <Tooltip label="Share">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={onShare}
            >
              <IconShare size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    );
  }

  if (variant === 'compact') {
    return (
      <Group gap="xs">
        <Tooltip label={`Email: ${email}`}>
          <ActionIcon
            variant="subtle"
            size="sm"
            component="a"
            href={`mailto:${email}`}
          >
            <IconMail size={14} />
          </ActionIcon>
        </Tooltip>
        {alumni.phone && (
          <Tooltip label={`Phone: ${alumni.phone}`}>
            <ActionIcon
              variant="subtle"
              size="sm"
              component="a"
              href={`tel:${alumni.phone}`}
            >
              <IconPhone size={14} />
            </ActionIcon>
          </Tooltip>
        )}
        {alumni.linkedinUrl && (
          <Tooltip label="LinkedIn Profile">
            <ActionIcon
              variant="subtle"
              size="sm"
              component="a"
              href={alumni.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandLinkedin size={14} />
            </ActionIcon>
          </Tooltip>
        )}
        {alumni.websiteUrl && (
          <Tooltip label="Personal Website">
            <ActionIcon
              variant="subtle"
              size="sm"
              component="a"
              href={alumni.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWorld size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    );
  }

  // Full variant
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Title order={4}>Contact Information</Title>
        
        <Stack gap="sm">
          {/* Email */}
          <Group justify="space-between">
            <Group gap="md">
              <IconMail size={16} color="gray" />
              <Anchor href={`mailto:${email}`} size="sm">
                {email}
              </Anchor>
            </Group>
            <CopyButton value={email}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied!' : 'Copy email'}>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={copy}
                  >
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>

          {/* Phone */}
          {alumni.phone && (
            <Group justify="space-between">
              <Group gap="md">
                <IconPhone size={16} color="gray" />
                <Anchor href={`tel:${alumni.phone}`} size="sm">
                  {alumni.phone}
                </Anchor>
              </Group>
              <CopyButton value={alumni.phone}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy phone'}>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={copy}
                    >
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          )}

          {/* Location */}
          {alumni.location && (
            <Group gap="md">
              <IconMapPin size={16} color="gray" />
              <Text size="sm">{alumni.location}</Text>
            </Group>
          )}
        </Stack>

        {/* Social Links */}
        {(alumni.linkedinUrl || alumni.websiteUrl) && (
          <>
            <Divider />
            <Stack gap="sm">
              <Text size="sm" fw={500}>Social Links</Text>
              {alumni.linkedinUrl && (
                <Group gap="md">
                  <IconBrandLinkedin size={16} color="gray" />
                  <Anchor
                    href={alumni.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                  >
                    LinkedIn Profile
                  </Anchor>
                </Group>
              )}
              {alumni.websiteUrl && (
                <Group gap="md">
                  <IconWorld size={16} color="gray" />
                  <Anchor
                    href={alumni.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                  >
                    Personal Website
                  </Anchor>
                </Group>
              )}
            </Stack>
          </>
        )}

        {/* Action Buttons */}
        {showActions && (
          <>
            <Divider />
            <Group gap="xs">
              <Button
                variant="light"
                size="sm"
                leftSection={<IconMail size={14} />}
                component="a"
                href={`mailto:${email}`}
                flex={1}
              >
                Email
              </Button>
              {alumni.phone && (
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPhone size={14} />}
                  component="a"
                  href={`tel:${alumni.phone}`}
                  flex={1}
                >
                  Call
                </Button>
              )}
              {onMessage && (
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconMessage size={14} />}
                  onClick={onMessage}
                  flex={1}
                >
                  Message
                </Button>
              )}
            </Group>
          </>
        )}
      </Stack>
    </Card>
  );
}

// Quick contact component for inline use
interface QuickContactProps {
  alumni: AlumniProfile;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function QuickContact({ alumni, size = 'sm' }: QuickContactProps) {
  const email = `${alumni.firstName.toLowerCase()}.${alumni.lastName.toLowerCase()}@example.com`;
  
  return (
    <Group gap="xs">
      <Tooltip label="Send Email">
        <ActionIcon
          variant="subtle"
          size={size}
          component="a"
          href={`mailto:${email}`}
        >
          <IconMail size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
        </ActionIcon>
      </Tooltip>
      
      {alumni.phone && (
        <Tooltip label="Call">
          <ActionIcon
            variant="subtle"
            size={size}
            component="a"
            href={`tel:${alumni.phone}`}
          >
            <IconPhone size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
          </ActionIcon>
        </Tooltip>
      )}
      
      {alumni.linkedinUrl && (
        <Tooltip label="LinkedIn">
          <ActionIcon
            variant="subtle"
            size={size}
            component="a"
            href={alumni.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandLinkedin size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}