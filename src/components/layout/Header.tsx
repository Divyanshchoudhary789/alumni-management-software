'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Group,
  Burger,
  TextInput,
  ActionIcon,
  Text,
  Indicator,
  rem,
  Loader,
  Paper,
  Stack,
  UnstyledButton,
  Badge,
  Transition,
} from '@mantine/core';
import {
  IconSearch,
  IconBell,
  IconUser,
  IconCalendar,
  IconMail,
  IconCoin,
  IconUserCheck,
} from '@tabler/icons-react';
import { useNavigationStore, SearchResult } from '@/stores/navigationStore';
import { useDebouncedValue, useClickOutside } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import classes from './Header.module.css';

interface HeaderProps {
  mobileOpened: boolean;
  desktopOpened: boolean;
  toggleMobile: () => void;
  toggleDesktop: () => void;
}

const getTypeIcon = (type: SearchResult['type']) => {
  const iconProps = { size: 16 };
  switch (type) {
    case 'alumni':
      return <IconUser {...iconProps} />;
    case 'event':
      return <IconCalendar {...iconProps} />;
    case 'communication':
      return <IconMail {...iconProps} />;
    case 'donation':
      return <IconCoin {...iconProps} />;
    case 'mentorship':
      return <IconUserCheck {...iconProps} />;
    default:
      return <IconSearch {...iconProps} />;
  }
};

const getTypeBadgeColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'alumni':
      return 'blue';
    case 'event':
      return 'green';
    case 'communication':
      return 'orange';
    case 'donation':
      return 'yellow';
    case 'mentorship':
      return 'purple';
    default:
      return 'gray';
  }
};

export function Header({
  mobileOpened,
  desktopOpened,
  toggleMobile,
  toggleDesktop,
}: HeaderProps) {
  const router = useRouter();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const {
    searchQuery,
    isSearching,
    searchResults,
    setSearchQuery,
    setIsSearching,
    setSearchResults,
    setIsNavigating,
    clearSearch,
  } = useNavigationStore();

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const searchRef = useClickOutside(() => setShowSearchResults(false));

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]);
    }
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setIsNavigating(true);
    router.push(result.url);
    setShowSearchResults(false);
    clearSearch();

    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  };

  const performSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearchQuery]);

  // Handle input focus
  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="sm"
          size="sm"
          aria-label="Toggle mobile navigation"
        />
        <Burger
          opened={desktopOpened}
          onClick={toggleDesktop}
          visibleFrom="sm"
          size="sm"
          aria-label="Toggle desktop navigation"
        />
        <Text size="lg" fw={600} className={classes.logo}>
          Alumni Dashboard
        </Text>
      </Group>

      <div className={classes.headerActions}>
        <div className={classes.searchContainer} ref={searchRef}>
          <form onSubmit={handleSearch}>
            <TextInput
              placeholder="Search alumni, events..."
              leftSection={
                <IconSearch style={{ width: rem(16), height: rem(16) }} />
              }
              rightSection={isSearching ? <Loader size="xs" /> : null}
              value={searchQuery}
              onChange={event => setSearchQuery(event.currentTarget.value)}
              onFocus={handleSearchFocus}
              className={classes.searchInput}
              visibleFrom="sm"
              aria-label="Search"
            />
          </form>

          <Transition
            mounted={showSearchResults && searchResults.length > 0}
            transition="fade"
            duration={200}
          >
            {styles => (
              <Paper
                shadow="md"
                p="xs"
                className={classes.searchResults}
                style={styles}
              >
                <Stack gap="xs">
                  {searchResults.slice(0, 5).map(result => (
                    <UnstyledButton
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className={classes.searchResultItem}
                    >
                      <Group gap="sm" wrap="nowrap">
                        {getTypeIcon(result.type)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs" wrap="nowrap">
                            <Text size="sm" fw={500} truncate>
                              {result.title}
                            </Text>
                            <Badge
                              size="xs"
                              color={getTypeBadgeColor(result.type)}
                              variant="light"
                            >
                              {result.type}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed" truncate>
                            {result.description}
                          </Text>
                        </div>
                      </Group>
                    </UnstyledButton>
                  ))}
                  {searchResults.length > 5 && (
                    <Text size="xs" c="dimmed" ta="center" p="xs">
                      +{searchResults.length - 5} more results
                    </Text>
                  )}
                </Stack>
              </Paper>
            )}
          </Transition>
        </div>

        <div className={classes.notificationButton}>
          <Indicator inline label="3" size={16} color="red" disabled={false}>
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="Notifications (3 unread)"
              title="Notifications"
            >
              <IconBell style={{ width: rem(20), height: rem(20) }} />
            </ActionIcon>
          </Indicator>
        </div>
      </div>
    </Group>
  );
}
