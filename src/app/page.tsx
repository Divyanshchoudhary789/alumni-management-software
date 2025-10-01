import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="lg">
        <Title order={1} ta="center">
          Alumni Management Dashboard
        </Title>
        <Text size="lg" ta="center" c="dimmed">
          A comprehensive web application for managing alumni networks
        </Text>

        <Group gap="md">
          <Button component={Link} href="/dashboard" size="lg">
            Go to Dashboard
          </Button>
          <Button
            component={Link}
            href="/dev-signin"
            variant="outline"
            size="lg"
          >
            Test Users
          </Button>
        </Group>

        <Text size="sm" c="dimmed" ta="center">
          💡 Authentication will be implemented later
        </Text>
      </Stack>
    </Container>
  );
}
