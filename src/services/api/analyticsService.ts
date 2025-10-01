import { apiClient } from '@/lib/api';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  granularity?: 'hour' | 'day' | 'week' | 'month';
  segment?: string;
}

export interface EngagementMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  pageViews: number;
  uniquePageViews: number;
  bounceRate: number;
  conversionRate: number;
  trends: {
    users: number;
    sessions: number;
    pageViews: number;
    engagement: number;
  };
}

export interface DemographicsData {
  ageDistribution: Array<{
    ageRange: string;
    count: number;
    percentage: number;
  }>;
  locationDistribution: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  graduationYearDistribution: Array<{
    year: number;
    count: number;
    percentage: number;
  }>;
  industryDistribution: Array<{
    industry: string;
    count: number;
    percentage: number;
  }>;
  skillsDistribution: Array<{
    skill: string;
    count: number;
    percentage: number;
  }>;
}

export interface EventAnalytics {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  averageAttendanceRate: number;
  popularEvents: Array<{
    title: string;
    registrations: number;
    attendance: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    events: number;
    registrations: number;
    attendance: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface DonationAnalytics {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  uniqueDonors: number;
  recurringDonors: number;
  donorRetentionRate: number;
  monthlyTrends: Array<{
    month: string;
    amount: number;
    count: number;
    donors: number;
  }>;
  amountDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  campaignPerformance: Array<{
    campaign: string;
    raised: number;
    goal: number;
    percentage: number;
  }>;
}

export interface CommunicationAnalytics {
  totalCommunications: number;
  sentCommunications: number;
  totalRecipients: number;
  averageOpenRate: number;
  averageClickRate: number;
  averageBounceRate: number;
  unsubscribeRate: number;
  monthlyTrends: Array<{
    month: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  typePerformance: Array<{
    type: string;
    sent: number;
    openRate: number;
    clickRate: number;
  }>;
  topPerformingCommunications: Array<{
    title: string;
    openRate: number;
    clickRate: number;
  }>;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type:
    | 'alumni'
    | 'events'
    | 'donations'
    | 'communications'
    | 'mentorship'
    | 'custom';
  filters: AnalyticsFilters;
  metrics: string[];
  visualizations: Array<{
    type: 'chart' | 'table' | 'metric';
    config: Record<string, any>;
  }>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class AnalyticsApiService {
  // Get engagement metrics
  async getEngagementMetrics(
    filters: AnalyticsFilters = {}
  ): Promise<EngagementMetrics> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/analytics/engagement${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<EngagementMetrics>(endpoint);
  }

  // Get demographics data
  async getDemographicsData(
    filters: AnalyticsFilters = {}
  ): Promise<DemographicsData> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/analytics/demographics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<DemographicsData>(endpoint);
  }

  // Get event analytics
  async getEventAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<EventAnalytics> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/analytics/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<EventAnalytics>(endpoint);
  }

  // Get donation analytics
  async getDonationAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<DonationAnalytics> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/analytics/donations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<DonationAnalytics>(endpoint);
  }

  // Get communication analytics
  async getCommunicationAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<CommunicationAnalytics> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/analytics/communications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<CommunicationAnalytics>(endpoint);
  }

  // Get real-time analytics data
  async getRealTimeData(): Promise<{
    activeUsers: number;
    currentSessions: number;
    pageViews: number;
    recentActivities: Array<{
      type: string;
      count: number;
      timestamp: Date;
    }>;
    topPages: Array<{
      page: string;
      views: number;
      uniqueViews: number;
    }>;
  }> {
    return apiClient.get('/analytics/realtime');
  }

  // Get custom reports
  async getCustomReports(
    filters: {
      page?: number;
      limit?: number;
      type?: string;
      createdBy?: string;
    } = {}
  ): Promise<{
    reports: CustomReport[];
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

    const endpoint = `/api/analytics/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  }

  // Create custom report
  async createCustomReport(data: Partial<CustomReport>): Promise<CustomReport> {
    return apiClient.post<CustomReport>('/analytics/reports', data);
  }

  // Update custom report
  async updateCustomReport(
    id: string,
    data: Partial<CustomReport>
  ): Promise<CustomReport> {
    return apiClient.put<CustomReport>(`/api/analytics/reports/${id}`, data);
  }

  // Delete custom report
  async deleteCustomReport(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `/api/analytics/reports/${id}`
    );
  }

  // Generate report data
  async generateReportData(reportId: string): Promise<{
    data: Record<string, any>;
    generatedAt: Date;
    filters: AnalyticsFilters;
  }> {
    return apiClient.post(`/api/analytics/reports/${reportId}/generate`);
  }

  // Export analytics data
  async exportData(
    type: 'csv' | 'excel' | 'pdf',
    filters: AnalyticsFilters & {
      dataType:
        | 'engagement'
        | 'demographics'
        | 'events'
        | 'donations'
        | 'communications';
    }
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    return apiClient.post('/analytics/export', { type, filters });
  }
}

export const analyticsApiService = new AnalyticsApiService();
