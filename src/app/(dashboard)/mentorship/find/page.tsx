import { Container, Title, Text } from '@mantine/core';

export default function FindMentorPage() {
  return (
    <Container size="xl" py="xl">
      <Title order={1}>Find Mentor</Title>
      <Text c="dimmed" mt="sm">
        Find and connect with mentors
      </Text>
      <Text mt="lg">Mentor finding will be implemented in future tasks.</Text>
    </Container>
  );
}
