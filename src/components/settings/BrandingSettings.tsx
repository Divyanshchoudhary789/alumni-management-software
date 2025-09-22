'use client';

import { useState } from 'react';
import {
  Stack,
  Grid,
  TextInput,
  Button,
  Group,
  Title,
  Text,
  Card,
  ColorInput,
  FileInput,
  Image,
  Box,
  Alert,
  Textarea,
  Switch,
  Select,
  LoadingOverlay,
  ActionIcon,
  Paper
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { 
  IconUpload, 
  IconCheck, 
  IconAlertCircle, 
  IconPalette, 
  IconPhoto,
  IconX,
  IconEye
} from '@tabler/icons-react';
import { settingsService } from '@/lib/mock-services/settingsService';

interface BrandingSettings {
  organizationName: string;
  organizationLogo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  customCSS?: string;
  footerText?: string;
  welcomeMessage?: string;
  enableCustomBranding: boolean;
  logoPosition: 'left' | 'center' | 'right';
  theme: 'light' | 'dark' | 'auto';
}

export function BrandingSettings() {
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const form = useForm<BrandingSettings>({
    initialValues: {
      organizationName: 'Alumni Management System',
      primaryColor: '#228be6',
      secondaryColor: '#495057',
      accentColor: '#51cf66',
      backgroundColor: '#ffffff',
      textColor: '#212529',
      customCSS: '',
      footerText: '© 2024 Alumni Management System. All rights reserved.',
      welcomeMessage: 'Welcome to our Alumni Community!',
      enableCustomBranding: true,
      logoPosition: 'left',
      theme: 'light'
    },
    validate: {
      organizationName: (value) => (!value ? 'Organization name is required' : null),
      primaryColor: (value) => (!value ? 'Primary color is required' : null),
      secondaryColor: (value) => (!value ? 'Secondary color is required' : null)
    }
  });

  const handleSubmit = async (values: BrandingSettings) => {
    setLoading(true);
    try {
      await settingsService.updateBrandingSettings(values);
      notifications.show({
        title: 'Branding Updated',
        message: 'Branding settings have been saved successfully',
        color: 'green',
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update branding settings',
        color: 'red',
        icon: <IconAlertCircle size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        form.setFieldValue('organizationLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFaviconPreview(result);
        form.setFieldValue('favicon', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const ColorPreview = ({ color, label }: { color: string; label: string }) => (
    <Paper p="xs" withBorder radius="md">
      <Group gap="xs">
        <Box
          w={20}
          h={20}
          style={{
            backgroundColor: color,
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}
        />
        <Text size="xs" c="dimmed">{label}</Text>
      </Group>
    </Paper>
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg" pos="relative">
        <LoadingOverlay visible={loading} />

        {/* Basic Branding */}
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Basic Branding</Title>
            <Switch
              label="Enable Custom Branding"
              {...form.getInputProps('enableCustomBranding', { type: 'checkbox' })}
            />
          </Group>

          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Organization Name"
                placeholder="Enter organization name"
                required
                {...form.getInputProps('organizationName')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Textarea
                label="Welcome Message"
                placeholder="Enter welcome message for users"
                rows={3}
                {...form.getInputProps('welcomeMessage')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Textarea
                label="Footer Text"
                placeholder="Enter footer text"
                rows={3}
                {...form.getInputProps('footerText')}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Logo and Images */}
        <Card withBorder>
          <Title order={3} mb="md">Logo and Images</Title>
          <Grid>
            <Grid.Col span={6}>
              <Stack gap="sm">
                <Text size="sm" fw={500}>Organization Logo</Text>
                <FileInput
                  placeholder="Upload logo"
                  accept="image/*"
                  leftSection={<IconUpload size={16} />}
                  onChange={handleLogoUpload}
                />
                {logoPreview && (
                  <Box pos="relative" w="fit-content">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      h={80}
                      w="auto"
                      radius="md"
                    />
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="filled"
                      pos="absolute"
                      top={-8}
                      right={-8}
                      onClick={() => {
                        setLogoPreview(null);
                        form.setFieldValue('organizationLogo', '');
                      }}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </Box>
                )}
                <Select
                  label="Logo Position"
                  data={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' }
                  ]}
                  {...form.getInputProps('logoPosition')}
                />
              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap="sm">
                <Text size="sm" fw={500}>Favicon</Text>
                <FileInput
                  placeholder="Upload favicon"
                  accept="image/*"
                  leftSection={<IconPhoto size={16} />}
                  onChange={handleFaviconUpload}
                />
                {faviconPreview && (
                  <Box pos="relative" w="fit-content">
                    <Image
                      src={faviconPreview}
                      alt="Favicon preview"
                      h={32}
                      w={32}
                      radius="md"
                    />
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="filled"
                      pos="absolute"
                      top={-8}
                      right={-8}
                      onClick={() => {
                        setFaviconPreview(null);
                        form.setFieldValue('favicon', '');
                      }}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </Box>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Color Scheme */}
        <Card withBorder>
          <Title order={3} mb="md">Color Scheme</Title>
          <Grid>
            <Grid.Col span={6}>
              <ColorInput
                label="Primary Color"
                placeholder="Select primary color"
                required
                {...form.getInputProps('primaryColor')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <ColorInput
                label="Secondary Color"
                placeholder="Select secondary color"
                required
                {...form.getInputProps('secondaryColor')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <ColorInput
                label="Accent Color"
                placeholder="Select accent color"
                {...form.getInputProps('accentColor')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <ColorInput
                label="Background Color"
                placeholder="Select background color"
                {...form.getInputProps('backgroundColor')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <ColorInput
                label="Text Color"
                placeholder="Select text color"
                {...form.getInputProps('textColor')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Theme"
                data={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto (System)' }
                ]}
                {...form.getInputProps('theme')}
              />
            </Grid.Col>
          </Grid>

          {/* Color Preview */}
          <Box mt="md">
            <Text size="sm" fw={500} mb="xs">Color Preview</Text>
            <Group gap="xs">
              <ColorPreview color={form.values.primaryColor} label="Primary" />
              <ColorPreview color={form.values.secondaryColor} label="Secondary" />
              <ColorPreview color={form.values.accentColor} label="Accent" />
              <ColorPreview color={form.values.backgroundColor} label="Background" />
              <ColorPreview color={form.values.textColor} label="Text" />
            </Group>
          </Box>
        </Card>

        {/* Advanced Customization */}
        <Card withBorder>
          <Title order={3} mb="md">Advanced Customization</Title>
          <Alert icon={<IconPalette size={16} />} mb="md">
            Custom CSS will be applied globally. Use with caution and test thoroughly.
          </Alert>
          <Textarea
            label="Custom CSS"
            placeholder="Enter custom CSS rules..."
            rows={8}
            {...form.getInputProps('customCSS')}
          />
        </Card>

        {/* Preview Section */}
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Preview</Title>
            <Button
              variant="light"
              leftSection={<IconEye size={16} />}
              onClick={() => {
                notifications.show({
                  title: 'Preview',
                  message: 'Preview functionality would show live changes',
                  color: 'blue'
                });
              }}
            >
              Live Preview
            </Button>
          </Group>
          <Paper
            p="md"
            withBorder
            style={{
              backgroundColor: form.values.backgroundColor,
              color: form.values.textColor,
              borderColor: form.values.secondaryColor
            }}
          >
            <Group gap="md" mb="md">
              {logoPreview && (
                <Image src={logoPreview} alt="Logo" h={40} w="auto" />
              )}
              <Text
                size="lg"
                fw={700}
                style={{ color: form.values.primaryColor }}
              >
                {form.values.organizationName}
              </Text>
            </Group>
            <Text mb="sm">{form.values.welcomeMessage}</Text>
            <Button
              style={{
                backgroundColor: form.values.primaryColor,
                color: form.values.backgroundColor
              }}
            >
              Sample Button
            </Button>
          </Paper>
        </Card>

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            Save Branding Settings
          </Button>
        </Group>
      </Stack>
    </form>
  );
}