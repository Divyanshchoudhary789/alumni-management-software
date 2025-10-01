import { Box, Center, Container, Stack, Title, Text } from '@mantine/core';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container size="lg" h="100vh">
        <Center h="100%">
          <Stack align="center" gap="xl" w="100%">
            {/* Branding */}
            <Stack align="center" gap="sm">
              <Title order={1} c="white" ta="center">
                Alumni Network
              </Title>
              <Text c="white" ta="center" opacity={0.9}>
                Connect, Engage, and Grow Together
              </Text>
            </Stack>

            {/* Auth Forms */}
            {children}
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
