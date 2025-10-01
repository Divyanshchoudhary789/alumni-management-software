// Export all API services
export * from './alumniService';
export * from './authService';
export * from './eventsService';
export * from './dashboardService';
export * from './donationsService';
export * from './communicationsService';
export * from './mentorshipService';
export * from './analyticsService';
export * from './settingsService';
export * from './uploadService';

// Re-export API client
export { apiClient, checkBackendHealth } from '@/lib/api';

// Combined API client for easy access
import { alumniApiService } from './alumniService';
import { authApiService } from './authService';
import { eventsApiService } from './eventsService';
import { dashboardApiService } from './dashboardService';
import { donationsApiService } from './donationsService';
import { communicationsApiService } from './communicationsService';
import { mentorshipApiService } from './mentorshipService';
import { analyticsApiService } from './analyticsService';
import { settingsApiService } from './settingsService';
import { uploadApiService } from './uploadService';

export interface ApiClient {
  alumni: typeof alumniApiService;
  auth: typeof authApiService;
  events: typeof eventsApiService;
  dashboard: typeof dashboardApiService;
  donations: typeof donationsApiService;
  communications: typeof communicationsApiService;
  mentorship: typeof mentorshipApiService;
  analytics: typeof analyticsApiService;
  settings: typeof settingsApiService;
  upload: typeof uploadApiService;
}

// Main API client instance
export const realApiClient: ApiClient = {
  alumni: alumniApiService,
  auth: authApiService,
  events: eventsApiService,
  dashboard: dashboardApiService,
  donations: donationsApiService,
  communications: communicationsApiService,
  mentorship: mentorshipApiService,
  analytics: analyticsApiService,
  settings: settingsApiService,
  upload: uploadApiService,
};
