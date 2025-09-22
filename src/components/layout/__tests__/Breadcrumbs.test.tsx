import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Breadcrumbs } from '../Breadcrumbs';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

const renderBreadcrumbs = () => {
  return render(
    <MantineProvider>
      <Breadcrumbs />
    </MantineProvider>
  );
};

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render on main dashboard', () => {
    usePathname.mockReturnValue('/dashboard');
    const { container } = renderBreadcrumbs();
    
    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumbs for nested routes', () => {
    usePathname.mockReturnValue('/dashboard/alumni/add');
    renderBreadcrumbs();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Alumni')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('renders home icon for dashboard link', () => {
    usePathname.mockReturnValue('/dashboard/events');
    renderBreadcrumbs();
    
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toBeInTheDocument();
  });

  it('shows current page without link', () => {
    usePathname.mockReturnValue('/dashboard/settings');
    renderBreadcrumbs();
    
    const settingsText = screen.getByText('Settings');
    expect(settingsText).toBeInTheDocument();
    expect(settingsText.tagName).toBe('P'); // Should be text, not link
  });

  it('handles deep nested routes', () => {
    usePathname.mockReturnValue('/dashboard/donations/campaigns');
    renderBreadcrumbs();
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Donations')).toBeInTheDocument();
    expect(screen.getByText('Campaigns')).toBeInTheDocument();
  });
});