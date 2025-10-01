// Export all mock data
export * from './alumni';
export * from './events';
export * from './donations';
export * from './communications';
export * from './dashboard';
export * from './mentorship';

// Combined mock data generator
import { generateMockAlumni } from './alumni';
import { generateMockEvents, generateMockEventRegistrations } from './events';
import { generateMockDonations } from './donations';
import { generateMockCommunications } from './communications';
import {
  generateDashboardMetrics,
  generateRecentActivities,
} from './dashboard';
import { generateMockMentorshipConnections } from './mentorship';

export interface MockDataSet {
  alumni: ReturnType<typeof generateMockAlumni>;
  events: ReturnType<typeof generateMockEvents>;
  eventRegistrations: ReturnType<typeof generateMockEventRegistrations>;
  donations: ReturnType<typeof generateMockDonations>;
  communications: ReturnType<typeof generateMockCommunications>;
  mentorshipConnections: ReturnType<typeof generateMockMentorshipConnections>;
  dashboardMetrics: ReturnType<typeof generateDashboardMetrics>;
  recentActivities: ReturnType<typeof generateRecentActivities>;
}

// Generate complete mock dataset
export const generateCompleteMockData = (options?: {
  alumniCount?: number;
  eventsCount?: number;
  donationsCount?: number;
  communicationsCount?: number;
  mentorshipCount?: number;
}): MockDataSet => {
  const {
    alumniCount = 50,
    eventsCount = 20,
    donationsCount = 100,
    communicationsCount = 20,
    mentorshipCount = 20,
  } = options || {};

  // Generate base data
  const alumni = generateMockAlumni(alumniCount);
  const events = generateMockEvents(eventsCount);
  const donations = generateMockDonations(
    donationsCount,
    alumni.map(a => a.id)
  );
  const communications = generateMockCommunications(communicationsCount);

  // Generate dependent data
  const eventRegistrations = generateMockEventRegistrations(events, alumni);
  const mentorshipConnections = generateMockMentorshipConnections(
    mentorshipCount,
    alumni.slice(0, 10).map(a => a.id), // First 10 as potential mentors
    alumni.slice(10).map(a => a.id) // Rest as potential mentees
  );

  // Generate dashboard data
  const dashboardMetrics = generateDashboardMetrics(
    alumni.length,
    events,
    donations
  );
  const recentActivities = generateRecentActivities(alumni, events, donations);

  return {
    alumni,
    events,
    eventRegistrations,
    donations,
    communications,
    mentorshipConnections,
    dashboardMetrics,
    recentActivities,
  };
};

// Default mock data instance
export const mockData = generateCompleteMockData();
