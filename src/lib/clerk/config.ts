import { Appearance } from '@clerk/types';

// Clerk appearance configuration for consistent styling
export const clerkAppearance: Appearance = {
  elements: {
    // Form styling
    formButtonPrimary: 
      'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
    formButtonSecondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 transition-colors duration-200',
    
    // Card styling
    card: 'shadow-lg border border-gray-200 rounded-lg',
    cardBox: 'shadow-none',
    
    // Input styling
    formFieldInput:
      'border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200',
    formFieldLabel: 'text-gray-700 font-medium mb-1',
    
    // Social buttons
    socialButtonsBlockButton:
      'border border-gray-300 hover:bg-gray-50 rounded-md py-2 px-4 transition-colors duration-200 flex items-center justify-center gap-2',
    socialButtonsBlockButtonText: 'font-medium text-gray-700',
    
    // Links
    footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
    
    // Header
    headerTitle: 'text-xl font-semibold text-gray-900',
    headerSubtitle: 'text-gray-600',
    
    // Divider
    dividerLine: 'bg-gray-200',
    dividerText: 'text-gray-500 text-sm',
    
    // Error messages
    formFieldErrorText: 'text-red-600 text-sm mt-1',
    
    // Loading
    spinner: 'text-blue-600',
  },
  layout: {
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: '#2563eb',
    colorDanger: '#dc2626',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorNeutral: '#6b7280',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '0.375rem',
  },
};

// OAuth provider configurations
export const oauthProviders = [
  {
    provider: 'oauth_google' as const,
    name: 'Google',
    icon: 'google',
  },
  {
    provider: 'oauth_linkedin_oidc' as const,
    name: 'LinkedIn',
    icon: 'linkedin',
  },
];

// Role-based redirect URLs
export const getRedirectUrl = (role: string = 'alumni') => {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'alumni':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

// Error messages for authentication failures
export const authErrorMessages = {
  'session_expired': 'Your session has expired. Please sign in again.',
  'unauthorized': 'You do not have permission to access this resource.',
  'oauth_error': 'There was an error with the OAuth provider. Please try again.',
  'network_error': 'Network error occurred. Please check your connection and try again.',
  'invalid_credentials': 'Invalid credentials provided.',
  'account_locked': 'Your account has been temporarily locked. Please contact support.',
  'email_not_verified': 'Please verify your email address before continuing.',
  'default': 'An authentication error occurred. Please try again.',
};

// User onboarding configuration
export const onboardingSteps = {
  alumni: [
    {
      step: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your graduation year, degree, and current position',
      required: true,
    },
    {
      step: 'preferences',
      title: 'Set Your Preferences',
      description: 'Choose your communication preferences and interests',
      required: false,
    },
    {
      step: 'welcome',
      title: 'Welcome to the Alumni Network',
      description: 'Explore events, connect with fellow alumni, and more',
      required: false,
    },
  ],
  admin: [
    {
      step: 'admin_setup',
      title: 'Admin Setup',
      description: 'Configure your administrative preferences',
      required: true,
    },
    {
      step: 'system_overview',
      title: 'System Overview',
      description: 'Learn about the admin dashboard features',
      required: false,
    },
  ],
};

// Session configuration
export const sessionConfig = {
  maxAge: 24 * 60 * 60, // 24 hours in seconds
  updateAge: 60 * 60, // 1 hour in seconds
};