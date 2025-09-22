'use client';

import { usePathname } from 'next/navigation';
import { Breadcrumbs as MantineBreadcrumbs, Anchor, Text } from '@mantine/core';
import Link from 'next/link';
import { IconHome } from '@tabler/icons-react';
import classes from './Breadcrumbs.module.css';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  alumni: 'Alumni',
  events: 'Events',
  communications: 'Communications',
  donations: 'Donations',
  mentorship: 'Mentorship',
  analytics: 'Analytics',
  settings: 'Settings',
  profile: 'Profile',
  add: 'Add',
  create: 'Create',
  edit: 'Edit',
  campaigns: 'Campaigns',
  find: 'Find Mentor',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on the main dashboard
  if (pathname === '/dashboard') {
    return null;
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Remove the first segment if it's 'dashboard'
  if (pathSegments[0] === 'dashboard') {
    pathSegments.shift();
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
  ];

  // Build breadcrumb items from path segments
  let currentPath = '/dashboard';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    breadcrumbItems.push({
      title: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath,
    });
  });

  const items = breadcrumbItems.map((item, index) => {
    if (item.href) {
      return (
        <Anchor component={Link} href={item.href} key={index} className={classes.breadcrumbLink}>
          {index === 0 && <IconHome size={16} style={{ marginRight: 4 }} />}
          {item.title}
        </Anchor>
      );
    }
    
    return (
      <Text key={index} className={classes.currentPage}>
        {item.title}
      </Text>
    );
  });

  return (
    <div className={classes.breadcrumbContainer}>
      <MantineBreadcrumbs separator="/" className={classes.breadcrumbs}>
        {items}
      </MantineBreadcrumbs>
    </div>
  );
}