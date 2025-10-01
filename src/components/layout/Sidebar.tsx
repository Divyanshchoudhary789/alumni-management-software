'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Group,
  Code,
  ScrollArea,
  rem,
  NavLink,
  Stack,
  Text,
  Divider,
  Menu,
  Avatar,
  UnstyledButton,
} from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconCalendarEvent,
  IconMail,
  IconCoin,
  IconUserCheck,
  IconChartBar,
  IconSettings,
  IconUser,
  IconChevronRight,
  IconLogout,
  IconChevronUp,
} from '@tabler/icons-react';
import { useNavigationStore } from '@/stores/navigationStore';
import classes from './Sidebar.module.css';
import { getDevUser } from '@/lib/dev-config';

interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  roles?: string[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: IconDashboard,
    href: '/dashboard',
  },
  {
    label: 'Alumni',
    icon: IconUsers,
    href: '/alumni',
    children: [
      { label: 'Directory', icon: IconUsers, href: '/alumni' },
      {
        label: 'Add Alumni',
        icon: IconUser,
        href: '/alumni/add',
        roles: ['admin'],
      },
    ],
  },
  {
    label: 'Events',
    icon: IconCalendarEvent,
    href: '/events',
    children: [
      { label: 'All Events', icon: IconCalendarEvent, href: '/events' },
      {
        label: 'Create Event',
        icon: IconCalendarEvent,
        href: '/events/create',
        roles: ['admin'],
      },
    ],
  },
  {
    label: 'Communications',
    icon: IconMail,
    href: '/communications',
    roles: ['admin'],
    children: [
      { label: 'All Messages', icon: IconMail, href: '/communications' },
      {
        label: 'Create Message',
        icon: IconMail,
        href: '/communications/create',
      },
    ],
  },
  {
    label: 'Donations',
    icon: IconCoin,
    href: '/donations',
    roles: ['admin'],
    children: [
      { label: 'All Donations', icon: IconCoin, href: '/donations' },
      { label: 'Campaigns', icon: IconCoin, href: '/donations/campaigns' },
    ],
  },
  {
    label: 'Mentorship',
    icon: IconUserCheck,
    href: '/mentorship',
    children: [
      { label: 'Connections', icon: IconUserCheck, href: '/mentorship' },
      { label: 'Find Mentor', icon: IconUserCheck, href: '/mentorship/find' },
    ],
  },
  {
    label: 'Analytics',
    icon: IconChartBar,
    href: '/analytics',
    roles: ['admin'],
  },
  {
    label: 'Settings',
    icon: IconSettings,
    href: '/settings',
    roles: ['admin'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [devUser, setDevUser] = useState(null);
  const { setActiveRoute } = useNavigationStore();

  // Ensure we're on the client side and get dev user
  useEffect(() => {
    setIsClient(true);
    setDevUser(getDevUser());
  }, []);

  // Update active route in store when pathname changes
  useEffect(() => {
    setActiveRoute(pathname);
  }, [pathname, setActiveRoute]);

  // Auto-expand sections that contain the active route
  useEffect(() => {
    navigationItems.forEach(item => {
      if (item.children && item.children.some(child => isActive(child.href))) {
        if (!openSections.includes(item.label)) {
          setOpenSections(prev => [...prev, item.label]);
        }
      }
    });
  }, [pathname]);

  // Use dev user or default to admin role
  const user =
    isClient && devUser ? devUser : { publicMetadata: { role: 'admin' } };

  // Get user role from user metadata or default to 'admin'
  const userRole = (user?.publicMetadata?.role as string) || 'admin';

  const toggleSection = (label: string) => {
    setOpenSections(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isItemVisible = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    const { setIsNavigating } = useNavigationStore.getState();
    setIsNavigating(true);
    router.push(href);

    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!isItemVisible(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections.includes(item.label);
    const active = isActive(item.href);

    // Safety check for icon component
    const IconComponent = item.icon;
    if (!IconComponent) {
      console.warn(`Icon missing for nav item: ${item.label}`);
      return null;
    }

    if (hasChildren) {
      return (
        <div key={item.label}>
          <NavLink
            label={item.label}
            leftSection={
              <IconComponent style={{ width: rem(18), height: rem(18) }} />
            }
            rightSection={
              <IconChevronRight
                style={{
                  width: rem(16),
                  height: rem(16),
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                  transition: 'transform 200ms ease',
                }}
              />
            }
            onClick={() => toggleSection(item.label)}
            active={active}
            className={classes.navLink}
            data-level={level}
          />
          {isOpen && (
            <Stack gap={0} ml="md">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </Stack>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.label}
        label={item.label}
        leftSection={
          <IconComponent style={{ width: rem(18), height: rem(18) }} />
        }
        onClick={() => handleNavigation(item.href)}
        active={active}
        className={classes.navLink}
        data-level={level}
      />
    );
  };

  const handleSignOut = async () => {
    // Clear dev user and redirect to home
    localStorage.removeItem('dev-user');
    router.push('/');
  };

  // Use dev user or default user
  const currentUser =
    isClient && devUser
      ? devUser
      : {
          fullName: 'Guest User',
          emailAddresses: [{ emailAddress: 'guest@example.com' }],
          imageUrl: 'https://via.placeholder.com/40',
        };

  return (
    <div className={classes.sidebar}>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {navigationItems.map(item => renderNavItem(item))}
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <Divider my="sm" />

        {/* User Profile Menu */}
        <Menu shadow="md" width={200} position="top-start">
          <Menu.Target>
            <UnstyledButton className={classes.userButton}>
              <Group justify="space-between" w="100%">
                <Group gap="sm">
                  <Avatar
                    src={currentUser?.imageUrl}
                    alt={currentUser?.fullName || 'User'}
                    radius="xl"
                    size={32}
                  />
                  <div>
                    <Text fw={500} size="sm" lh={1}>
                      {currentUser?.fullName || 'Guest User'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Role: {userRole}
                    </Text>
                  </div>
                </Group>
                <IconChevronUp
                  style={{ width: rem(12), height: rem(12) }}
                  stroke={1.5}
                />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                <IconUser style={{ width: rem(16), height: rem(16) }} />
              }
              onClick={() => router.push('/profile')}
            >
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconSettings style={{ width: rem(16), height: rem(16) }} />
              }
              onClick={() => router.push('/settings')}
            >
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={
                <IconLogout style={{ width: rem(16), height: rem(16) }} />
              }
              onClick={handleSignOut}
              color="red"
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {/* Version Info */}
        <Group justify="center" mt="xs">
          <Code fw={700} className={classes.version}>
            v1.0.0
          </Code>
        </Group>
      </div>
    </div>
  );
}
