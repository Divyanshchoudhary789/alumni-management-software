'use client';

import { useState, useEffect } from 'react';
import { AppShell, Text } from '@mantine/core';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import classes from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpened, setMobileOpened] = useState(false);
  const [desktopOpened, setDesktopOpened] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const toggleMobile = () => setMobileOpened(prev => !prev);
  const toggleDesktop = () => setDesktopOpened(prev => !prev);
  const closeMobile = () => setMobileOpened(false);

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close mobile navigation when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileOpened) {
        closeMobile();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpened]);

  if (!isClient) {
    return (
      <div className={classes.loadingContainer}>
        <Text>Loading...</Text>
      </div>
    );
  }

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding={0}
      >
        <AppShell.Header>
          <Header
            mobileOpened={mobileOpened}
            desktopOpened={desktopOpened}
            toggleMobile={toggleMobile}
            toggleDesktop={toggleDesktop}
          />
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Sidebar />
        </AppShell.Navbar>

        <AppShell.Main>
          <div className={classes.mainContent}>
            <Breadcrumbs />
            {children}
          </div>
        </AppShell.Main>
      </AppShell>
      
      <LoadingOverlay />
    </>
  );
}