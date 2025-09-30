import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export function useUserRole() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<'admin' | 'alumni' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      // Check user role from Clerk metadata or database
      // For now, we'll use a simple check based on email or metadata
      const userRole = user?.publicMetadata?.role as 'admin' | 'alumni' || 'alumni';
      setRole(userRole);
      setLoading(false);
    }
  }, [user, isLoaded]);

  return {
    role,
    isAdmin: role === 'admin',
    isAlumni: role === 'alumni',
    loading: loading || !isLoaded,
  };
}