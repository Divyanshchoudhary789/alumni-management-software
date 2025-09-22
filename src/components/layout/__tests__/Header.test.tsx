import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Header } from '../Header';

// Mock the navigation store
jest.mock('@/stores/navigationStore', () => ({
  useNavigationStore: () => ({
    searchQuery: '',
    isSearching: false,
    searchResults: [],
    setSearchQuery: jest.fn(),
    setIsSearching: jest.fn(),
    setSearchResults: jest.fn(),
    clearSearch: jest.fn(),
  }),
}));

const mockProps = {
  mobileOpened: false,
  desktopOpened: true,
  toggleMobile: jest.fn(),
  toggleDesktop: jest.fn(),
};

const renderHeader = () => {
  return render(
    <MantineProvider>
      <Header {...mockProps} />
    </MantineProvider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders header with logo and user menu', () => {
    renderHeader();
    
    expect(screen.getByText('Alumni Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderHeader();
    
    expect(screen.getByPlaceholderText('Search alumni, events...')).toBeInTheDocument();
  });

  it('renders notification indicator', () => {
    renderHeader();
    
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('renders user menu with profile options', async () => {
    renderHeader();
    
    const userButton = screen.getByText('Test User').closest('button');
    fireEvent.click(userButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });
  });

  it('handles burger menu toggles', () => {
    renderHeader();
    
    const burgers = screen.getAllByRole('button', { name: /open navigation/i });
    
    if (burgers.length > 0) {
      fireEvent.click(burgers[0]);
      expect(mockProps.toggleMobile).toHaveBeenCalled();
    }
  });
});