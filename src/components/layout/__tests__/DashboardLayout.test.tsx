import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { DashboardLayout } from '../DashboardLayout';

// Mock child components
jest.mock('../Header', () => ({
  Header: ({ toggleMobile, toggleDesktop }: any) => (
    <div data-testid="header">
      <button onClick={toggleMobile}>Toggle Mobile</button>
      <button onClick={toggleDesktop}>Toggle Desktop</button>
    </div>
  ),
}));

jest.mock('../Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('../Breadcrumbs', () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>,
}));

const renderDashboardLayout = (
  children: React.ReactNode = <div>Test Content</div>
) => {
  return render(
    <MantineProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </MantineProvider>
  );
};

describe('DashboardLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when user is not loaded', () => {
    // Mock useUser to return loading state
    const mockUseUser = require('@clerk/nextjs').useUser;
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
    });

    renderDashboardLayout();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders layout components when user is loaded', () => {
    renderDashboardLayout();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    const testContent = <div>Custom Test Content</div>;
    renderDashboardLayout(testContent);

    expect(screen.getByText('Custom Test Content')).toBeInTheDocument();
  });
});
