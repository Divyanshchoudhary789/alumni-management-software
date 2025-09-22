// Using any for now to avoid import issues during development
export interface ClerkUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  imageUrl?: string;
  publicMetadata?: Record<string, any>;
  // Add any custom properties you might need
  role?: 'admin' | 'alumni';
  alumniProfileId?: string;
}

export interface AuthContextType {
  user: ClerkUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}

export interface UserMetadata {
  role: 'admin' | 'alumni';
  alumniProfileId?: string;
  onboardingCompleted?: boolean;
  lastLoginAt?: string;
}

export interface ClerkWebhookEvent {
  data: {
    id: string;
    object: string;
    attributes: Record<string, any>;
  };
  object: string;
  type: 'user.created' | 'user.updated' | 'user.deleted';
}