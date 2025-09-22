// Development configuration for when Clerk keys are not available
// Only check client-side environment variables to avoid hydration mismatch
export const isDevelopmentMode = typeof window !== 'undefined' ? 
  process.env.NODE_ENV === 'development' && 
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your-') || 
   !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) :
  false;

// Get development user from localStorage or use default
export const getDevUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUser = localStorage.getItem('dev-user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn('Failed to parse stored dev user:', error);
  }
  
  // Default mock user if none stored
  return {
    id: 'dev-user-id',
    fullName: 'Development User',
    firstName: 'Development',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'dev@example.com' }],
    imageUrl: 'https://via.placeholder.com/40',
    publicMetadata: { role: 'admin' },
  };
};

export const devConfig = {
  // Development routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/dev-signin',
    '/dashboard', // Allow dashboard access in dev mode
    '/alumni',
    '/events',
    '/communications',
    '/donations',
    '/mentorship',
    '/analytics',
    '/settings',
  ],
};