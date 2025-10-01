import { useUser } from '@clerk/nextjs';
import { 
  hasPermission, 
  canAccessRoute, 
  getRolePermissions, 
  canManageUsers,
  isAdmin,
  isAlumni,
  UserRole 
} from '@/lib/rbac';

/**
 * Custom hook for role-based access control
 * Provides easy permission checking in React components
 */
export function usePermissions() {
  const { user } = useUser();
  
  // Get user role from Clerk metadata
  const userRole: UserRole = (user?.unsafeMetadata?.role as UserRole) || 'alumni';

  return {
    // User info
    userRole,
    isAuthenticated: !!user,
    
    // Permission checking functions
    hasPermission: (resource: string, action: string) => 
      hasPermission(userRole, resource, action),
    
    canAccessRoute: (route: string) => 
      canAccessRoute(userRole, route),
    
    canManageUsers: () => 
      canManageUsers(userRole),
    
    isAdmin: () => 
      isAdmin(userRole),
    
    isAlumni: () => 
      isAlumni(userRole),
    
    // Get all permissions for current user
    getAllPermissions: () => 
      getRolePermissions(userRole),
    
    // Convenience methods for common checks
    canViewAlumni: () => 
      hasPermission(userRole, 'alumni', 'view'),
    
    canEditAlumni: () => 
      hasPermission(userRole, 'alumni', 'edit'),
    
    canCreateEvents: () => 
      hasPermission(userRole, 'events', 'create'),
    
    canManageEvents: () => 
      hasPermission(userRole, 'events', 'manage_registrations'),
    
    canSendCommunications: () => 
      hasPermission(userRole, 'communications', 'send'),
    
    canViewDonations: () => 
      hasPermission(userRole, 'donations', 'view'),
    
    canViewAnalytics: () => 
      hasPermission(userRole, 'analytics', 'view'),
    
    canConfigureSystem: () => 
      hasPermission(userRole, 'system', 'configure'),
  };
}

/**
 * Hook for checking specific permission
 * Useful for conditional rendering
 */
export function useHasPermission(resource: string, action: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(resource, action);
}

/**
 * Hook for checking route access
 * Useful for navigation guards
 */
export function useCanAccessRoute(route: string): boolean {
  const { canAccessRoute } = usePermissions();
  return canAccessRoute(route);
}

/**
 * Hook for admin-only features
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = usePermissions();
  return isAdmin();
}

/**
 * Hook for alumni features (includes admin)
 */
export function useIsAlumni(): boolean {
  const { isAlumni } = usePermissions();
  return isAlumni();
}