import { apiClient } from '@/lib/api';

export interface DashboardMetrics {
  totalAlumni: number;
  activeMembers: number;
  upcomingEvents: number;
  monthlyDonations: number;
  trends: {
    alumniGrowth: number;
    memberActivity: number;
    eventAttendance: number;
    donationGrowth: number;
  };
}

export interface RecentActivity {
  id: string;
  type:
    | 'new_alumni'
    | 'event_created'
    | 'donation'
    | 'mentorship'
    | 'communication';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ActivityFilters {
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}

class DashboardApiService {
  // Get dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return apiClient.get<DashboardMetrics>('/dashboard/metrics');
  }

  // Get recent activities
  async getRecentActivities(
    filters: ActivityFilters = {}
  ): Promise<RecentActivity[]> {
    return apiClient.get<RecentActivity[]>('/dashboard/activities', filters);
  }

  // Get chart data for alumni growth
  async getAlumniGrowthData(
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<
    Array<{
      date: string;
      count: number;
      growth: number;
    }>
  > {
    return apiClient.get(
      `/dashboard/charts/alumni-growth?period=${period}`
    );
  }

  // Get chart data for event attendance
  async getEventAttendanceData(
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<
    Array<{
      date: string;
      events: number;
      attendance: number;
      registrations: number;
    }>
  > {
    return apiClient.get(
      `/dashboard/charts/event-attendance?period=${period}`
    );
  }

  // Get chart data for donation trends
  async getDonationTrendsData(
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<
    Array<{
      date: string;
      amount: number;
      count: number;
      average: number;
    }>
  > {
    return apiClient.get(
      `/dashboard/charts/donation-trends?period=${period}`
    );
  }
}

export const dashboardApiService = new DashboardApiService();
