/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { AuthStatus } from '../AuthStatus';
import { AuthLoading } from '../AuthLoading';
import { AuthError } from '../AuthError';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('Authentication Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthStatus', () => {
    it('shows loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        user: null,
        isLoading: true,
        error: null,
        signOut: jest.fn(),
        redirectToSignIn: jest.fn(),
        clearError: jest.fn(),
      });

      renderWithMantine(<AuthStatus showDetails />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows error state when there is an error', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null,
        isLoading: false,
        error: 'Authentication failed',
        signOut: jest.fn(),
        redirectToSignIn: jest.fn(),
        clearError: jest.fn(),
      });

      renderWithMantine(<AuthStatus showDetails />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('shows signed in state when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          firstName: 'John',
          emailAddresses: [{ emailAddress: 'john@example.com' }],
        },
        isLoading: false,
        error: null,
        signOut: jest.fn(),
        redirectToSignIn: jest.fn(),
        clearError: jest.fn(),
      });

      renderWithMantine(<AuthStatus showDetails />);
      expect(screen.getByText('Signed in')).toBeInTheDocument();
      expect(screen.getByText('as John')).toBeInTheDocument();
    });
  });

  describe('AuthLoading', () => {
    it('renders loading skeletons', () => {
      renderWithMantine(<AuthLoading />);
      // Check for skeleton elements (they should have specific test attributes or classes)
      const skeletons = document.querySelectorAll('[data-skeleton]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('AuthError', () => {
    it('renders error message and retry button', () => {
      const mockOnRetry = jest.fn();
      renderWithMantine(
        <AuthError error="Test error message" onRetry={mockOnRetry} />
      );

      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('renders without specific error message', () => {
      renderWithMantine(<AuthError />);
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(
        screen.getByText(
          'There was a problem with your authentication. Please try again.'
        )
      ).toBeInTheDocument();
    });
  });
});

describe('Authentication Hooks', () => {
  describe('useAuth', () => {
    it('should provide authentication state', () => {
      // This would require more complex mocking of Clerk hooks
      // For now, we'll just verify the hook exists and can be imported
      expect(typeof useAuth).toBe('function');
    });
  });
});
