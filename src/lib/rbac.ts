/**
 * Role-Based Access Control (RBAC) utilities
 * Provides comprehensive permission checking and role management
 */

export type UserRole = 'admin' | 'alumni';

export interface Permission {
  resource: string;
  action: string;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // Alumni management
    { resource: 'alumni', action: 'view' },
    { resource: 'alumni', action: 'create' },
    { resource: 'alumni', action: 'edit' },
    { resource: 'alumni', action: 'delete' },
    { resource: 'alumni', action: 'export' },
    
    // Event management
    { resource: 'events', action: 'view' },
    { resource: 'events', action: 'create' },
    { resource: 'events', action: 'edit' },
    { resource: 'events', action: 'delete' },
    { resource: 'events', action: 'manage_registrations' },
    
    // Communications
    { resource: 'communications', action: 'view' },
    { resource: 'communications', action: 'create' },
    { resource: 'communications', action: 'edit' },
    { resource: 'communications', action: 'delete' },
    { resource: 'communications', action: 'send' },
    
    // Donations
    { resource: 'donations', action: 'view' },
    { resource: 'donations', action: 'create' },
    { resource: 'donations', action: 'edit' },
    { resource: 'donations', action: 'delete' },
    { resource: 'donations', action: 'view_reports' },
    
    // Mentorship
    { resource: 'mentorship', action: 'view' },
    { resource: 'mentorship', action: 'create' },
    { resource: 'mentorship', action: 'edit' },
    { resource: 'mentorship', action: 'delete' },
    { resource: 'mentorship', action: 'manage_connections' },
    
    // Analytics
    { resource: 'analytics', action: 'view' },
    { resource: 'analytics', action: 'export' },
    { resource: 'analytics', action: 'view_sensitive_data' },
    
    // Settings and administration
    { resource: 'settings', action: 'view' },
    { resource: 'settings', action: 'edit' },
    { resource: 'users', action: 'view' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'edit' },
    { resource: 'users', action: 'delete' },
    { resource: 'users', action: 'manage_roles' },
    { resource: 'system', action: 'configure' },
    { resource: 'integrations', action: 'manage' },
  ],
  
  alumni: [
    // Alumni management (limited)
    { resource: 'alumni', action: 'view' },
    { resource: 'alumni', action: 'edit_own' },
    
    // Event management (limited)
    { resource: 'events', action: 'view' },
    { resource: 'events', action: 'register' },
    { resource: 'events', action: 'unregister' },
    
    // Communications (limited)
    { resource: 'communications', action: 'view' },
    
    // Donations (limited)
    { resource: 'donations', action: 'view_own' },
    { resource: 'donations', action: 'create_own' },
    
    // Mentorship
    { resource: 'mentorship', action: 'view' },
    { resource: 'mentorship', action: 'create' },
    { resource: 'mentorship', action: 'edit_own' },
    { resource: 'mentorship', action: 'participate' },
    
    // Profile management
    { resource: 'profile', action: 'view_own' },
    { resource: 'profile', action: 'edit_own' },
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.some(
    (permission) =>
      permission.resource === resource && permission.action === action
  );
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Admin can access all routes
  if (userRole === 'admin') {
    return true;
  }

  // Define route access rules for alumni
  const alumniAccessibleRoutes = [
    '/dashboard',
    '/alumni',
    '/events',
    '/mentorship',
    '/profile',
    '/communications', // view only
  ];

  // Check if the route starts with any accessible route
  return alumniAccessibleRoutes.some((accessibleRoute) =>
    route.startsWith(accessibleRoute)
  );
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if a user can perform multiple actions on a resource
 */
export function hasMultiplePermissions(
  userRole: UserRole,
  resource: string,
  actions: string[]
): boolean {
  return actions.every((action) => hasPermission(userRole, resource, action));
}

/**
 * Get accessible resources for a role
 */
export function getAccessibleResources(userRole: UserRole): string[] {
  const permissions = getRolePermissions(userRole);
  const resources = new Set(permissions.map((p) => p.resource));
  return Array.from(resources);
}

/**
 * Get available actions for a resource and role
 */
export function getResourceActions(
  userRole: UserRole,
  resource: string
): string[] {
  const permissions = getRolePermissions(userRole);
  return permissions
    .filter((p) => p.resource === resource)
    .map((p) => p.action);
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'users', 'manage_roles');
}

/**
 * Check if user can access admin features
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

/**
 * Check if user can access alumni features
 */
export function isAlumni(userRole: UserRole): boolean {
  return userRole === 'alumni' || userRole === 'admin';
}

/**
 * Validate role assignment (prevent unauthorized role changes)
 */
export function canAssignRole(
  currentUserRole: UserRole,
  targetRole: UserRole
): boolean {
  // Only admins can assign roles
  if (currentUserRole !== 'admin') {
    return false;
  }

  // Admins can assign any role
  return true;
}

/**
 * Get user-friendly permission descriptions
 */
export const PERMISSION_DESCRIPTIONS: Record<string, Record<string, string>> = {
  alumni: {
    view: 'View alumni directory and profiles',
    create: 'Add new alumni to the system',
    edit: 'Edit alumni profiles',
    delete: 'Remove alumni from the system',
    export: 'Export alumni data',
    edit_own: 'Edit own profile',
  },
  events: {
    view: 'View events and event details',
    create: 'Create new events',
    edit: 'Edit event information',
    delete: 'Delete events',
    manage_registrations: 'Manage event registrations and attendance',
    register: 'Register for events',
    unregister: 'Cancel event registration',
  },
  communications: {
    view: 'View communications and announcements',
    create: 'Create new communications',
    edit: 'Edit communications',
    delete: 'Delete communications',
    send: 'Send communications to alumni',
  },
  donations: {
    view: 'View all donation records',
    create: 'Record new donations',
    edit: 'Edit donation records',
    delete: 'Delete donation records',
    view_reports: 'Access donation reports and analytics',
    view_own: 'View own donation history',
    create_own: 'Make donations',
  },
  mentorship: {
    view: 'View mentorship programs and connections',
    create: 'Create mentorship opportunities',
    edit: 'Edit mentorship information',
    delete: 'Remove mentorship connections',
    manage_connections: 'Manage mentor-mentee relationships',
    edit_own: 'Edit own mentorship profile',
    participate: 'Participate in mentorship programs',
  },
  analytics: {
    view: 'View analytics and reports',
    export: 'Export analytics data',
    view_sensitive_data: 'Access sensitive analytics information',
  },
  users: {
    view: 'View user accounts',
    create: 'Create new user accounts',
    edit: 'Edit user information',
    delete: 'Delete user accounts',
    manage_roles: 'Assign and modify user roles',
  },
  settings: {
    view: 'View system settings',
    edit: 'Modify system settings',
  },
  system: {
    configure: 'Configure system-wide settings',
  },
  integrations: {
    manage: 'Manage third-party integrations',
  },
  profile: {
    view_own: 'View own profile',
    edit_own: 'Edit own profile',
  },
};

/**
 * Get human-readable description for a permission
 */
export function getPermissionDescription(
  resource: string,
  action: string
): string {
  return PERMISSION_DESCRIPTIONS[resource]?.[action] || `${action} ${resource}`;
}