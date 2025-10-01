import { create } from 'zustand';

export interface SearchResult {
  id: string;
  type: 'alumni' | 'event' | 'communication' | 'donation' | 'mentorship';
  title: string;
  description: string;
  url: string;
}

interface NavigationState {
  activeRoute: string;
  searchQuery: string;
  isSearching: boolean;
  searchResults: SearchResult[];
  isNavigating: boolean;
  navigationHistory: string[];
  setActiveRoute: (route: string) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (searching: boolean) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsNavigating: (navigating: boolean) => void;
  addToHistory: (route: string) => void;
  clearSearch: () => void;
  getRouteTitle: (route: string) => string;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/alumni': 'Alumni Directory',
  '/dashboard/alumni/add': 'Add Alumni',
  '/dashboard/events': 'Events',
  '/dashboard/events/create': 'Create Event',
  '/dashboard/communications': 'Communications',
  '/dashboard/communications/create': 'Create Communication',
  '/dashboard/donations': 'Donations',
  '/dashboard/donations/campaigns': 'Donation Campaigns',
  '/dashboard/mentorship': 'Mentorship',
  '/dashboard/mentorship/find': 'Find Mentor',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
  '/dashboard/profile': 'Profile',
};

export const useNavigationStore = create<NavigationState>((set, get) => ({
  activeRoute: '/dashboard',
  searchQuery: '',
  isSearching: false,
  searchResults: [],
  isNavigating: false,
  navigationHistory: ['/dashboard'],

  setActiveRoute: route => {
    set({ activeRoute: route });
    get().addToHistory(route);
  },

  setSearchQuery: query => set({ searchQuery: query }),

  setIsSearching: searching => set({ isSearching: searching }),

  setSearchResults: results => set({ searchResults: results }),

  setIsNavigating: navigating => set({ isNavigating: navigating }),

  addToHistory: route => {
    const { navigationHistory } = get();
    const newHistory = [...navigationHistory];

    // Remove the route if it already exists to avoid duplicates
    const existingIndex = newHistory.indexOf(route);
    if (existingIndex > -1) {
      newHistory.splice(existingIndex, 1);
    }

    // Add to the beginning
    newHistory.unshift(route);

    // Keep only the last 10 routes
    if (newHistory.length > 10) {
      newHistory.pop();
    }

    set({ navigationHistory: newHistory });
  },

  clearSearch: () =>
    set({ searchQuery: '', searchResults: [], isSearching: false }),

  getRouteTitle: route => {
    return (
      routeTitles[route] || route.split('/').pop()?.replace('-', ' ') || 'Page'
    );
  },
}));
