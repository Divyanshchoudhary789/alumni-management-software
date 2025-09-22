'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigationStore } from '@/stores/navigationStore';

export function useRouteTransition() {
  const pathname = usePathname();
  const { setIsNavigating, setActiveRoute } = useNavigationStore();

  useEffect(() => {
    // Set navigation state when route changes
    setIsNavigating(true);
    setActiveRoute(pathname);

    // Reset navigation state after a short delay
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, setIsNavigating, setActiveRoute]);

  return { pathname };
}