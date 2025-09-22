import { Container, Title, Text } from '@mantine/core';

export default function CreateCommunicationPage() {

  return (
    <Container size="xl" py="xl">
      <Title order={1}>Create Message</Title>
      <Text c="dimmed" mt="sm">
        Create a new communication or newsletter
      </Text>
      <Text mt="lg">Communication creation will be implemented in future tasks.</Text>
    </Container>
  );
}