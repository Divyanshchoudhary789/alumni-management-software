import { Container, Title, Text } from '@mantine/core';

export default function ProfilePage() {

  return (
    <Container size="xl" py="xl">
      <Title order={1}>Profile</Title>
      <Text c="dimmed" mt="sm">
        Manage your profile settings
      </Text>
      <Text mt="lg">Profile management will be implemented in future tasks.</Text>
    </Container>
  );
}