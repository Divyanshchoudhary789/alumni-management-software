// Export all mock services
export * from './base';
export * from './alumniService';
export * from './eventService';
export * from './donationService';
export * from './communicationService';
export * from './dashboardService';
export * from './mentorshipService';
export * from './analyticsService';
export * from './settingsService';

// Combined mock API client
import { mockAlumniService } from './alumniService';
import { mockEventService } from './eventService';
import { mockDonationService } from './donationService';
import { mockCommunicationService } from './communicationService';
import { mockDashboardService } from './dashboardService';
import { mockMentorshipService } from './mentorshipService';
import { mockAnalyticsService } from './analyticsService';
import { settingsService } from './settingsService';

export interface MockApiClient {
  alumni: typeof mockAlumniService;
  events: typeof mockEventService;
  donations: typeof mockDonationService;
  communications: typeof mockCommunicationService;
  dashboard: typeof mockDashboardService;
  mentorship: typeof mockMentorshipService;
  analytics: typeof mockAnalyticsService;
  settings: typeof settingsService;
}

// Main mock API client instance
export const mockApiClient: MockApiClient = {
  alumni: mockAlumniService,
  events: mockEventService,
  donations: mockDonationService,
  communications: mockCommunicationService,
  dashboard: mockDashboardService,
  mentorship: mockMentorshipService,
  analytics: mockAnalyticsService,
  settings: settingsService
};

// Utility functions for testing and development
export const resetMockData = () => {
  // This would reset all mock data to initial state
  // Useful for testing and development
  console.log('Mock data reset - implement if needed for testing');
};

export const enableMockErrors = (enabled: boolean = true) => {
  // This could be used to enable/disable mock errors globally
  // Useful for testing error scenarios
  console.log(`Mock errors ${enabled ? 'enabled' : 'disabled'}`);
};

// Mock API configuration
export const mockApiConfig = {
  baseDelay: 200, // Base delay in milliseconds
  maxDelay: 800,  // Maximum delay in milliseconds
  errorRate: 0.02, // Default error rate (2%)
  enableLogging: process.env.NODE_ENV === 'development'
};

// Development utilities
export const logMockApiCall = (service: string, method: string, params?: any) => {
  if (mockApiConfig.enableLogging) {
    console.log(`[Mock API] ${service}.${method}`, params);
  }
};