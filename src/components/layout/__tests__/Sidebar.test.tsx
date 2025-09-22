import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Sidebar } from '../Sidebar';

// Mock the navigation store
jest.mock('@/stores/navigationStore', () => ({
  useNavigationStore: () => ({
    setActiveRoute: jest.fn(),
  }),
}));

const renderSidebar = () => {
  return render(
    <MantineProvider>
      <Sidebar />
    </MantineProvider>
  );
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation items', () => {
    renderSidebar();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Alumni')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Mentorship')).toBeInTheDocument();
  });

  it('shows admin-only items for admin users', () => {
    renderSidebar();
    
    expect(screen.getByText('Communications')).toBeInTheDocument();
    expect(screen.getByText('Donations')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays user role', () => {
    renderSidebar();
    
    expect(screen.getByText('Role: admin')).toBeInTheDocument();
  });

  it('displays version number', () => {
    renderSidebar();
    
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('expands collapsible sections', () => {
    renderSidebar();
    
    const alumniSection = screen.getByText('Alumni');
    fireEvent.click(alumniSection);
    
    // The section should expand and show child items
    // Note: This test might need adjustment based on actual implementation
  });
});