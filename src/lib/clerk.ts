import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/alumni(.*)',
  '/events(.*)',
  '/communications(.*)',
  '/donations(.*)',
  '/mentorship(.*)',
  '/analytics(.*)',
  '/settings(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/oauth-callback',
  '/api/webhooks/clerk',
]);

export const clerkConfig = {
  // OAuth providers configuration
  providers: {
    google: {
      enabled: true,
      scope: 'openid email profile',
      strategy: 'oauth_google',
    },
    linkedin: {
      enabled: true,
      scope: 'r_liteprofile r_emailaddress',
      strategy: 'oauth_linkedin',
    },
  },

  // Appearance customization for consistent UI
  appearance: {
    elements: {
      formButtonPrimary:
        'bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors',
      card: 'shadow-lg border border-gray-200 rounded-lg bg-white',
      headerTitle: 'text-2xl font-bold text-gray-900 mb-2',
      headerSubtitle: 'text-gray-600 mb-4',
      socialButtonsBlockButton:
        'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors',
      socialButtonsBlockButtonText: 'font-medium',
      formFieldInput:
        'border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md px-3 py-2',
      formFieldLabel: 'text-gray-700 font-medium mb-1',
      footerActionLink:
        'text-blue-600 hover:text-blue-700 font-medium transition-colors',
      dividerLine: 'bg-gray-300',
      dividerText: 'text-gray-500 text-sm',
      identityPreviewText: 'text-gray-600',
      identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
      formResendCodeLink: 'text-blue-600 hover:text-blue-700',
      otpCodeFieldInput:
        'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    },
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorInputBackground: '#ffffff',
      colorInputText: '#1f2937',
      colorTextOnPrimaryBackground: '#ffffff',
      colorTextSecondary: '#6b7280',
      borderRadius: '0.5rem',
      spacingUnit: '1rem',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
  },

  // Localization and customization
  localization: {
    signIn: {
      start: {
        title: 'Welcome back',
        subtitle: 'Sign in to your alumni account',
      },
    },
    signUp: {
      start: {
        title: 'Join our community',
        subtitle: 'Create your alumni account',
      },
    },
  },

  // Sign-in and sign-up options
  signIn: {
    elements: {
      socialButtonsProviderIcon: 'w-5 h-5',
      socialButtonsBlockButton: 'mb-2',
    },
  },

  signUp: {
    elements: {
      socialButtonsProviderIcon: 'w-5 h-5',
      socialButtonsBlockButton: 'mb-2',
    },
  },
};

export { isProtectedRoute, isPublicRoute };
