import { apiClient } from '@/lib/api';

export interface SystemSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandingSettings {
  id: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS: string;
  footerText: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationSettings {
  id: string;
  emailProvider: {
    provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
    apiKey?: string;
    domain?: string;
    fromEmail: string;
    fromName: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUsername?: string;
    smtpPassword?: string;
    isEnabled: boolean;
  };
  paymentProvider: {
    provider: 'stripe' | 'paypal' | 'square';
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    isEnabled: boolean;
  };
  storageProvider: {
    provider: 'local' | 's3' | 'cloudinary' | 'gcs';
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
    cloudName?: string;
    isEnabled: boolean;
  };
  analyticsProvider: {
    provider: 'google' | 'mixpanel' | 'amplitude';
    trackingId?: string;
    apiKey?: string;
    isEnabled: boolean;
  };
  socialAuth: {
    google: {
      clientId?: string;
      clientSecret?: string;
      isEnabled: boolean;
    };
    linkedin: {
      clientId?: string;
      clientSecret?: string;
      isEnabled: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SecuritySettings {
  id: string;
  twoFactorAuth: {
    isEnabled: boolean;
    isRequired: boolean;
    methods: ('sms' | 'email' | 'app')[];
  };
  ipWhitelist: string[];
  rateLimiting: {
    isEnabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  sessionSecurity: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    requireReauthentication: boolean;
  };
  dataRetention: {
    logRetentionDays: number;
    userDataRetentionDays: number;
    backupRetentionDays: number;
  };
  encryption: {
    algorithm: string;
    keyRotationDays: number;
  };
  auditLogging: {
    isEnabled: boolean;
    logLevel: 'basic' | 'detailed' | 'verbose';
    retentionDays: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  id: string;
  emailNotifications: {
    newUserRegistration: boolean;
    eventRegistration: boolean;
    donationReceived: boolean;
    mentorshipRequest: boolean;
    systemAlerts: boolean;
  };
  pushNotifications: {
    isEnabled: boolean;
    newMessages: boolean;
    eventReminders: boolean;
    mentorshipUpdates: boolean;
  };
  smsNotifications: {
    isEnabled: boolean;
    eventReminders: boolean;
    urgentAlerts: boolean;
  };
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  createdAt: Date;
  updatedAt: Date;
}

class SettingsApiService {
  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    return apiClient.get<SystemSettings>('/settings/system');
  }

  async updateSystemSettings(
    data: Partial<SystemSettings>
  ): Promise<SystemSettings> {
    return apiClient.put<SystemSettings>('/settings/system', data);
  }

  // Branding Settings
  async getBrandingSettings(): Promise<BrandingSettings> {
    return apiClient.get<BrandingSettings>('/settings/branding');
  }

  async updateBrandingSettings(
    data: Partial<BrandingSettings>
  ): Promise<BrandingSettings> {
    return apiClient.put<BrandingSettings>('/settings/branding', data);
  }

  // Integration Settings
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    return apiClient.get<IntegrationSettings>('/settings/integrations');
  }

  async updateIntegrationSettings(
    data: Partial<IntegrationSettings>
  ): Promise<IntegrationSettings> {
    return apiClient.put<IntegrationSettings>('/settings/integrations', data);
  }

  async testIntegration(
    provider: string,
    config: Record<string, any>
  ): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, any>;
  }> {
    return apiClient.post(
      `/api/settings/integrations/${provider}/test`,
      config
    );
  }

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    return apiClient.get<SecuritySettings>('/settings/security');
  }

  async updateSecuritySettings(
    data: Partial<SecuritySettings>
  ): Promise<SecuritySettings> {
    return apiClient.put<SecuritySettings>('/settings/security', data);
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    return apiClient.get<NotificationSettings>('/settings/notifications');
  }

  async updateNotificationSettings(
    data: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    return apiClient.put<NotificationSettings>('/settings/notifications', data);
  }

  // User Management
  async getUsers(
    filters: {
      page?: number;
      limit?: number;
      role?: 'admin' | 'alumni';
      search?: string;
      status?: 'active' | 'inactive' | 'suspended';
    } = {}
  ): Promise<{
    users: Array<{
      id: string;
      email: string;
      role: 'admin' | 'alumni';
      status: 'active' | 'inactive' | 'suspended';
      lastLogin: Date;
      createdAt: Date;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/settings/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }

  async updateUserRole(
    userId: string,
    role: 'admin' | 'alumni'
  ): Promise<{ message: string }> {
    return apiClient.put(`/api/settings/users/${userId}/role`, { role });
  }

  async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<{ message: string }> {
    return apiClient.put(`/api/settings/users/${userId}/status`, { status });
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/settings/users/${userId}`);
  }

  // Backup and Restore
  async createBackup(): Promise<{
    backupId: string;
    downloadUrl: string;
    createdAt: Date;
    expiresAt: Date;
  }> {
    return apiClient.post('/settings/backup');
  }

  async getBackups(): Promise<
    Array<{
      id: string;
      filename: string;
      size: number;
      createdAt: Date;
      downloadUrl: string;
    }>
  > {
    return apiClient.get('/settings/backups');
  }

  async deleteBackup(backupId: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/settings/backups/${backupId}`);
  }

  // System Health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    database: {
      status: 'connected' | 'disconnected';
      responseTime: number;
    };
    storage: {
      status: 'available' | 'unavailable';
      usedSpace: number;
      totalSpace: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    lastChecked: Date;
  }> {
    return apiClient.get('/settings/health');
  }

  // Audit Logs
  async getAuditLogs(
    filters: {
      page?: number;
      limit?: number;
      userId?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    logs: Array<{
      id: string;
      userId: string;
      userEmail: string;
      action: string;
      resource: string;
      resourceId?: string;
      details: Record<string, any>;
      ipAddress: string;
      userAgent: string;
      timestamp: Date;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/settings/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }
}

export const settingsApiService = new SettingsApiService();
