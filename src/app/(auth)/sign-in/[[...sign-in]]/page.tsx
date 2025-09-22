import { SignIn } from '@clerk/nextjs';
import { Container, Paper, Title, Text, Stack } from '@mantine/core';

export default function SignInPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="xl">
        <Paper shadow="md" p="xl" radius="md" w="100%" maw={400}>
          <Stack align="center" gap="md">
            <Title order={2} ta="center">
              Welcome Back
            </Title>
            <Text c="dimmed" ta="center">
              Sign in to access your alumni dashboard
            </Text>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                  card: 'shadow-none',
                  socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                  formFieldInput: 'border border-gray-300 focus:border-blue-500',
                }
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}