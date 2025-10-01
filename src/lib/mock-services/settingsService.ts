import { simulateDelay } from './base';
import { SystemSettings, UserPermission } from '@/types';

interface CreateUserRequest {
  email: string;
  role: 'admin' | 'alumni';
  firstName: string;
  lastName: string;
}

interface BrandingSettings {
  organizationName: string;
  organizationLogo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  customCSS?: string;
  footerText?: string;
  welcomeMessage?: string;
  enableCustomBranding: boolean;
  logoPosition: 'left' | 'center' | 'right';
  theme: 'light' | 'dark' | 'auto';
}

interface IntegrationSettings {
  googleOAuth: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  linkedinOAuth: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  emailProvider: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
    apiKey?: string;
    domain?: string;
    region?: string;
  };
  paymentProcessor: {
    provider: 'stripe' | 'paypal' | 'none';
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
  };
  analytics: {
    googleAnalytics: {
      enabled: boolean;
      trackingId?: string;
    };
    mixpanel: {
      enabled: boolean;
      projectToken?: string;
    };
  };
  socialMedia: {
    facebook: {
      enabled: boolean;
      pageId?: string;
      accessToken?: string;
    };
    twitter: {
      enabled: boolean;
      apiKey?: string;
      apiSecret?: string;
    };
  };
}

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number;
  };
  sessionSettings: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    requireReauthentication: boolean;
  };
  twoFactorAuth: {
    enabled: boolean;
    enforceForAdmins: boolean;
    allowedMethods: string[];
  };
  loginSecurity: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    enableCaptcha: boolean;
    allowedIpRanges: string[];
  };
  auditSettings: {
    enableAuditLog: boolean;
    retentionPeriod: number;
    logFailedLogins: boolean;
    logDataChanges: boolean;
  };
}

class SettingsService {
  private async delay(ms: number = 500): Promise<void> {
    await simulateDelay(200, ms);
  }
  // System Configuration
  async getSystemSettings(): Promise<Partial<SystemSettings>> {
    await this.delay();
    return {
      id: '1',
      organizationName: 'Alumni Management System',
      primaryColor: '#228be6',
      secondaryColor: '#495057',
      emailSettings: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'system@university.edu',
        smtpPassword: '',
        fromEmail: 'noreply@university.edu',
        fromName: 'Alumni Management System',
      },
      notificationSettings: {
        enableEmailNotifications: true,
        enablePushNotifications: false,
        defaultNotificationFrequency: 'daily',
      },
      integrationSettings: {
        googleOAuth: {
          enabled: false,
          clientId: '',
          clientSecret: '',
        },
        linkedinOAuth: {
          enabled: false,
          clientId: '',
          clientSecret: '',
        },
        paymentProcessor: {
          provider: 'none',
          publicKey: '',
          secretKey: '',
        },
      },
      systemPreferences: {
        defaultTimeZone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        language: 'en',
        maintenanceMode: false,
        allowSelfRegistration: true,
        requireEmailVerification: true,
      },
      updatedAt: new Date(),
      updatedBy: 'admin',
    };
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    await this.delay();
    console.log('Updating system settings:', settings);
    // In a real implementation, this would save to the backend
  }

  // User Management
  async createUser(userData: CreateUserRequest): Promise<void> {
    await this.delay();
    console.log('Creating user:', userData);
    // In a real implementation, this would create a user via API
  }

  async getUserPermissions(userId: string): Promise<UserPermission | null> {
    await this.delay();
    // Mock permissions data
    return {
      id: `perm_${userId}`,
      userId,
      permissions: {
        alumni: {
          view: true,
          create: false,
          edit: false,
          delete: false,
        },
        events: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          manageRegistrations: false,
        },
        communications: {
          view: true,
          create: false,
          edit: false,
          delete: false,
          send: false,
        },
        donations: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          viewReports: false,
        },
        mentorship: {
          view: true,
          create: true,
          edit: false,
          delete: false,
          manageConnections: false,
        },
        analytics: {
          view: false,
          export: false,
          viewSensitiveData: false,
        },
        settings: {
          view: false,
          edit: false,
          manageUsers: false,
          manageIntegrations: false,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateUserPermissions(
    userId: string,
    permissions: UserPermission['permissions']
  ): Promise<void> {
    await this.delay();
    console.log('Updating user permissions:', userId, permissions);
    // In a real implementation, this would update permissions via API
  }

  // Branding Settings
  async getBrandingSettings(): Promise<BrandingSettings> {
    await this.delay();
    return {
      organizationName: 'Alumni Management System',
      primaryColor: '#228be6',
      secondaryColor: '#495057',
      accentColor: '#51cf66',
      backgroundColor: '#ffffff',
      textColor: '#212529',
      footerText: '© 2024 Alumni Management System. All rights reserved.',
      welcomeMessage: 'Welcome to our Alumni Community!',
      enableCustomBranding: true,
      logoPosition: 'left',
      theme: 'light',
    };
  }

  async updateBrandingSettings(settings: BrandingSettings): Promise<void> {
    await this.delay();
    console.log('Updating branding settings:', settings);
    // In a real implementation, this would save branding settings
  }

  // Integration Settings
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    await this.delay();
    return {
      googleOAuth: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/callback/google`,
      },
      linkedinOAuth: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        redirectUri: `${window.location.origin}/auth/callback/linkedin`,
      },
      emailProvider: {
        provider: 'smtp',
      },
      paymentProcessor: {
        provider: 'none',
      },
      analytics: {
        googleAnalytics: {
          enabled: false,
        },
        mixpanel: {
          enabled: false,
        },
      },
      socialMedia: {
        facebook: {
          enabled: false,
        },
        twitter: {
          enabled: false,
        },
      },
    };
  }

  async updateIntegrationSettings(
    settings: IntegrationSettings
  ): Promise<void> {
    await this.delay();
    console.log('Updating integration settings:', settings);
    // In a real implementation, this would save integration settings
  }

  async testIntegration(integration: string): Promise<boolean> {
    await this.delay(2000); // Simulate longer test time
    console.log('Testing integration:', integration);
    // In a real implementation, this would test the actual integration
    return Math.random() > 0.3; // 70% success rate for demo
  }

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    await this.delay();
    return {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        passwordExpiry: 90,
      },
      sessionSettings: {
        sessionTimeout: 60,
        maxConcurrentSessions: 3,
        requireReauthentication: false,
      },
      twoFactorAuth: {
        enabled: false,
        enforceForAdmins: true,
        allowedMethods: ['totp', 'sms'],
      },
      loginSecurity: {
        maxFailedAttempts: 5,
        lockoutDuration: 15,
        enableCaptcha: true,
        allowedIpRanges: [],
      },
      auditSettings: {
        enableAuditLog: true,
        retentionPeriod: 365,
        logFailedLogins: true,
        logDataChanges: true,
      },
    };
  }

  async updateSecuritySettings(settings: SecuritySettings): Promise<void> {
    await this.delay();
    console.log('Updating security settings:', settings);
    // In a real implementation, this would save security settings
  }
}

export const settingsService = new SettingsService();
