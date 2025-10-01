'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary:
            'bg-blue-600 hover:bg-blue-700 text-white font-medium',
          card: 'shadow-lg border border-gray-200 rounded-lg',
          headerTitle: 'text-2xl font-bold text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton:
            'border border-gray-300 hover:bg-gray-50 text-gray-700',
          socialButtonsBlockButtonText: 'font-medium',
          formFieldInput:
            'border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md',
          footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
          dividerLine: 'bg-gray-300',
          dividerText: 'text-gray-500',
          formFieldLabel: 'text-gray-700 font-medium',
          identityPreviewText: 'text-gray-600',
          identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
        },
        variables: {
          colorPrimary: '#2563eb',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#1f2937',
          borderRadius: '0.5rem',
          spacingUnit: '1rem',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      afterSignOutUrl="/sign-in"
    >
      {children}
    </ClerkProvider>
  );
}

export default AuthProvider;
