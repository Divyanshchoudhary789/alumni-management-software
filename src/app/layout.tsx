import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ClerkProvider } from '@clerk/nextjs';
import { theme } from '@/lib/theme';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Alumni Management Dashboard',
  description: 'A comprehensive web application for managing alumni networks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <ColorSchemeScript />
        </head>
        <body className={inter.className} suppressHydrationWarning>
          <MantineProvider theme={theme}>
            <Notifications />
            {children}
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
