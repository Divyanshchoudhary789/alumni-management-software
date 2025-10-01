import {
  AlumniProfile,
  Event,
  Donation,
  Communication,
  EventRegistration,
} from '@/types';
import { mockData } from '@/lib/mock-data';
import {
  simulateDelay,
  simulateError,
  createSuccessResponse,
  createErrorResponse,
  mockErrors,
  MockApiResponse,
} from './base';

export interface AnalyticsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  graduationYears?: number[];
  locations?: string[];
  companies?: string[];
  eventTypes?: string[];
  donationPurposes?: string[];
}

export interface EngagementMetrics {
  totalUsers: number;
  activeUsers: number;
  engagementRate: number;
  averageSessionDuration: number;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  returnVisitorRate: number;
}

export interface DemographicsData {
  graduationYears: Array<{ year: number; count: number }>;
  locations: Array<{ location: string; count: number }>;
  companies: Array<{ company: string; count: number }>;
  degrees: Array<{ degree: string; count: number }>;
  industries: Array<{ industry: string; count: number }>;
}

export interface EventAnalytics {
  totalEvents: number;
  averageAttendance: number;
  attendanceRate: number;
  popularEventTypes: Array<{
    type: string;
    count: number;
    avgAttendance: number;
  }>;
  monthlyEventTrends: Array<{
    month: string;
    events: number;
    attendance: number;
  }>;
  capacityUtilization: number;
}

export interface DonationAnalytics {
  totalAmount: number;
  totalDonations: number;
  averageDonation: number;
  donorRetentionRate: number;
  topDonationPurposes: Array<{
    purpose: string;
    amount: number;
    count: number;
  }>;
  monthlyTrends: Array<{ month: string; amount: number; count: number }>;
  donorSegments: Array<{ segment: string; count: number; totalAmount: number }>;
}

export interface CommunicationAnalytics {
  totalCommunications: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  engagementByType: Array<{
    type: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  monthlyTrends: Array<{ month: string; sent: number; opened: number }>;
}

export interface ExportData {
  alumni?: AlumniProfile[];
  events?: Event[];
  donations?: Donation[];
  communications?: Communication[];
  analytics?: any;
}

class MockAnalyticsService {
  // Get comprehensive engagement metrics
  async getEngagementMetrics(
    filters?: AnalyticsFilters
  ): Promise<MockApiResponse<EngagementMetrics>> {
    await simulateDelay(200, 500);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const totalUsers = mockData.alumni.length;
    const activeUsers = Math.floor(totalUsers * (0.65 + Math.random() * 0.2)); // 65-85% active

    const metrics: EngagementMetrics = {
      totalUsers,
      activeUsers,
      engagementRate: (activeUsers / totalUsers) * 100,
      averageSessionDuration: 8.5 + Math.random() * 5, // 8.5-13.5 minutes
      pageViews: totalUsers * (15 + Math.floor(Math.random() * 10)), // 15-25 pages per user
      uniqueVisitors: Math.floor(totalUsers * (0.8 + Math.random() * 0.15)), // 80-95% unique
      bounceRate: 25 + Math.random() * 15, // 25-40%
      returnVisitorRate: 60 + Math.random() * 20, // 60-80%
    };

    return createSuccessResponse(metrics);
  }

  // Get demographics breakdown
  async getDemographicsData(
    filters?: AnalyticsFilters
  ): Promise<MockApiResponse<DemographicsData>> {
    await simulateDelay(150, 350);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    let filteredAlumni = mockData.alumni;

    // Apply filters if provided
    if (filters?.graduationYears?.length) {
      filteredAlumni = filteredAlumni.filter(a =>
        filters.graduationYears!.includes(a.graduationYear)
      );
    }
    if (filters?.locations?.length) {
      filteredAlumni = filteredAlumni.filter(
        a => a.location && filters.locations!.includes(a.location)
      );
    }

    // Group by graduation years
    const yearCounts = filteredAlumni.reduce(
      (acc, alumni) => {
        acc[alumni.graduationYear] = (acc[alumni.graduationYear] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    // Group by locations
    const locationCounts = filteredAlumni.reduce(
      (acc, alumni) => {
        if (alumni.location) {
          acc[alumni.location] = (acc[alumni.location] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by companies
    const companyCounts = filteredAlumni.reduce(
      (acc, alumni) => {
        if (alumni.currentCompany) {
          acc[alumni.currentCompany] = (acc[alumni.currentCompany] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Group by degrees
    const degreeCounts = filteredAlumni.reduce(
      (acc, alumni) => {
        acc[alumni.degree] = (acc[alumni.degree] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Generate industry data from companies
    const industries = [
      'Technology',
      'Finance',
      'Healthcare',
      'Education',
      'Consulting',
      'Manufacturing',
      'Non-profit',
      'Government',
    ];
    const industryCounts = industries.reduce(
      (acc, industry) => {
        acc[industry] = Math.floor(Math.random() * 20) + 5;
        return acc;
      },
      {} as Record<string, number>
    );

    const demographics: DemographicsData = {
      graduationYears: Object.entries(yearCounts)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => b.year - a.year),
      locations: Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      companies: Object.entries(companyCounts)
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      degrees: Object.entries(degreeCounts)
        .map(([degree, count]) => ({ degree, count }))
        .sort((a, b) => b.count - a.count),
      industries: Object.entries(industryCounts)
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count),
    };

    return createSuccessResponse(demographics);
  }

  // Get event analytics
  async getEventAnalytics(
    filters?: AnalyticsFilters
  ): Promise<MockApiResponse<EventAnalytics>> {
    await simulateDelay(200, 400);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    let filteredEvents = mockData.events;

    if (filters?.dateRange) {
      filteredEvents = filteredEvents.filter(
        e =>
          e.eventDate >= filters.dateRange!.start &&
          e.eventDate <= filters.dateRange!.end
      );
    }

    const totalEvents = filteredEvents.length;
    const totalRegistrations = mockData.eventRegistrations.filter(r =>
      filteredEvents.some(e => e.id === r.eventId)
    );
    const totalAttended = totalRegistrations.filter(
      r => r.status === 'attended'
    ).length;
    const averageAttendance = totalEvents > 0 ? totalAttended / totalEvents : 0;
    const attendanceRate =
      totalRegistrations.length > 0
        ? (totalAttended / totalRegistrations.length) * 100
        : 0;

    // Event types analysis
    const eventTypes = [
      'Networking',
      'Workshop',
      'Social',
      'Career',
      'Fundraising',
    ];
    const popularEventTypes = eventTypes
      .map(type => {
        const typeEvents = Math.floor(Math.random() * 10) + 2;
        const avgAttendance = Math.floor(Math.random() * 50) + 20;
        return { type, count: typeEvents, avgAttendance };
      })
      .sort((a, b) => b.count - a.count);

    // Monthly trends
    const monthlyEventTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      monthlyEventTrends.push({
        month,
        events: Math.floor(Math.random() * 8) + 2,
        attendance: Math.floor(Math.random() * 200) + 50,
      });
    }

    const totalCapacity = filteredEvents.reduce(
      (sum, e) => sum + e.capacity,
      0
    );
    const capacityUtilization =
      totalCapacity > 0 ? (totalRegistrations.length / totalCapacity) * 100 : 0;

    const analytics: EventAnalytics = {
      totalEvents,
      averageAttendance,
      attendanceRate,
      popularEventTypes,
      monthlyEventTrends,
      capacityUtilization,
    };

    return createSuccessResponse(analytics);
  }

  // Get donation analytics
  async getDonationAnalytics(
    filters?: AnalyticsFilters
  ): Promise<MockApiResponse<DonationAnalytics>> {
    await simulateDelay(200, 400);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    let filteredDonations = mockData.donations.filter(
      d => d.status === 'completed'
    );

    if (filters?.dateRange) {
      filteredDonations = filteredDonations.filter(
        d =>
          d.donationDate >= filters.dateRange!.start &&
          d.donationDate <= filters.dateRange!.end
      );
    }

    const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = filteredDonations.length;
    const averageDonation =
      totalDonations > 0 ? totalAmount / totalDonations : 0;

    // Donor retention (simplified calculation)
    const uniqueDonors = new Set(filteredDonations.map(d => d.donorId)).size;
    const repeatDonors = filteredDonations.length - uniqueDonors;
    const donorRetentionRate =
      uniqueDonors > 0 ? (repeatDonors / uniqueDonors) * 100 : 0;

    // Top donation purposes
    const purposeCounts = filteredDonations.reduce(
      (acc, d) => {
        if (!acc[d.purpose]) {
          acc[d.purpose] = { amount: 0, count: 0 };
        }
        acc[d.purpose].amount += d.amount;
        acc[d.purpose].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    );

    const topDonationPurposes = Object.entries(purposeCounts)
      .map(([purpose, data]) => ({ purpose, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly trends
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const monthDonations = filteredDonations.filter(d => {
        const donationMonth = d.donationDate.getMonth();
        const donationYear = d.donationDate.getFullYear();
        return (
          donationMonth === date.getMonth() &&
          donationYear === date.getFullYear()
        );
      });

      monthlyTrends.push({
        month,
        amount: monthDonations.reduce((sum, d) => sum + d.amount, 0),
        count: monthDonations.length,
      });
    }

    // Donor segments
    const donorSegments = [
      {
        segment: 'Major Donors ($1000+)',
        count: Math.floor(uniqueDonors * 0.1),
        totalAmount: totalAmount * 0.6,
      },
      {
        segment: 'Regular Donors ($100-$999)',
        count: Math.floor(uniqueDonors * 0.3),
        totalAmount: totalAmount * 0.3,
      },
      {
        segment: 'Small Donors (<$100)',
        count: Math.floor(uniqueDonors * 0.6),
        totalAmount: totalAmount * 0.1,
      },
    ];

    const analytics: DonationAnalytics = {
      totalAmount,
      totalDonations,
      averageDonation,
      donorRetentionRate,
      topDonationPurposes,
      monthlyTrends,
      donorSegments,
    };

    return createSuccessResponse(analytics);
  }

  // Get communication analytics
  async getCommunicationAnalytics(
    filters?: AnalyticsFilters
  ): Promise<MockApiResponse<CommunicationAnalytics>> {
    await simulateDelay(150, 350);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const sentCommunications = mockData.communications.filter(
      c => c.status === 'sent'
    );
    const totalCommunications = sentCommunications.length;

    // Simulate engagement metrics
    const deliveryRate = 95 + Math.random() * 4; // 95-99%
    const openRate = 20 + Math.random() * 15; // 20-35%
    const clickRate = 2 + Math.random() * 6; // 2-8%

    // Engagement by type
    const communicationTypes = [
      'Newsletter',
      'Event Invitation',
      'Announcement',
      'Survey',
      'Fundraising',
    ];
    const engagementByType = communicationTypes.map(type => {
      const sent = Math.floor(Math.random() * 20) + 5;
      const opened = Math.floor(sent * (openRate / 100));
      const clicked = Math.floor(opened * (clickRate / 100));
      return { type, sent, opened, clicked };
    });

    // Monthly trends
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      monthlyTrends.push({
        month,
        sent: Math.floor(Math.random() * 15) + 5,
        opened: Math.floor(Math.random() * 100) + 50,
      });
    }

    const analytics: CommunicationAnalytics = {
      totalCommunications,
      deliveryRate,
      openRate,
      clickRate,
      engagementByType,
      monthlyTrends,
    };

    return createSuccessResponse(analytics);
  }

  // Export data in various formats
  async exportData(
    dataType:
      | 'alumni'
      | 'events'
      | 'donations'
      | 'communications'
      | 'analytics',
    format: 'csv' | 'pdf' | 'excel',
    filters?: AnalyticsFilters
  ): Promise<MockApiResponse<{ downloadUrl: string; filename: string }>> {
    await simulateDelay(1000, 3000); // Longer delay for export processing

    if (simulateError(0.02)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    // Simulate export processing
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${dataType}_export_${timestamp}.${format}`;
    const downloadUrl = `/api/exports/${filename}`;

    return createSuccessResponse({ downloadUrl, filename });
  }

  // Get real-time analytics updates
  async getRealTimeUpdates(): Promise<
    MockApiResponse<{
      activeUsers: number;
      recentActions: Array<{ action: string; timestamp: Date; user?: string }>;
      liveMetrics: {
        pageViews: number;
        newRegistrations: number;
        donations: number;
      };
    }>
  > {
    await simulateDelay(100, 200);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const activeUsers = Math.floor(Math.random() * 25) + 5; // 5-30 active users

    const actions = [
      'Profile Update',
      'Event Registration',
      'Donation',
      'Message Sent',
      'Login',
    ];
    const recentActions = Array.from({ length: 10 }, (_, i) => ({
      action: actions[Math.floor(Math.random() * actions.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000), // Last hour
      user:
        Math.random() > 0.3
          ? `User ${Math.floor(Math.random() * 100)}`
          : undefined,
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const liveMetrics = {
      pageViews: Math.floor(Math.random() * 100) + 50,
      newRegistrations: Math.floor(Math.random() * 5),
      donations: Math.floor(Math.random() * 3),
    };

    return createSuccessResponse({
      activeUsers,
      recentActions,
      liveMetrics,
    });
  }

  // Get custom report data
  async getCustomReport(
    metrics: string[],
    filters?: AnalyticsFilters,
    groupBy?: 'day' | 'week' | 'month' | 'year'
  ): Promise<MockApiResponse<Array<Record<string, any>>>> {
    await simulateDelay(300, 800);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    // Generate custom report data based on requested metrics
    const periods =
      groupBy === 'day'
        ? 30
        : groupBy === 'week'
          ? 12
          : groupBy === 'month'
            ? 12
            : 5;
    const data = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();

      if (groupBy === 'day') {
        date.setDate(date.getDate() - i);
      } else if (groupBy === 'week') {
        date.setDate(date.getDate() - i * 7);
      } else if (groupBy === 'month') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setFullYear(date.getFullYear() - i);
      }

      const period =
        groupBy === 'day'
          ? date.toLocaleDateString()
          : groupBy === 'week'
            ? `Week of ${date.toLocaleDateString()}`
            : groupBy === 'month'
              ? date.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : date.getFullYear().toString();

      const row: Record<string, any> = { period };

      metrics.forEach(metric => {
        switch (metric) {
          case 'alumni_count':
            row[metric] = Math.floor(Math.random() * 50) + 100;
            break;
          case 'donations_amount':
            row[metric] = Math.floor(Math.random() * 10000) + 5000;
            break;
          case 'events_count':
            row[metric] = Math.floor(Math.random() * 10) + 2;
            break;
          case 'engagement_rate':
            row[metric] = Math.floor(Math.random() * 30) + 60;
            break;
          default:
            row[metric] = Math.floor(Math.random() * 100);
        }
      });

      data.push(row);
    }

    return createSuccessResponse(data);
  }
}

export const mockAnalyticsService = new MockAnalyticsService();
