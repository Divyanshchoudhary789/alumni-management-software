import { DashboardMetrics, RecentActivity } from '@/types';
import { mockData, mockChartData } from '@/lib/mock-data';
import {
  simulateDelay,
  simulateError,
  createSuccessResponse,
  createErrorResponse,
  mockErrors,
  MockApiResponse,
} from './base';

class MockDashboardService {
  // Get dashboard metrics
  async getDashboardMetrics(): Promise<MockApiResponse<DashboardMetrics>> {
    await simulateDelay(200, 500);

    if (simulateError(0)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    // Generate dynamic metrics based on current mock data
    const metrics: DashboardMetrics = {
      totalAlumni: mockData.alumni.length,
      activeMembers: Math.floor(mockData.alumni.length * 0.72), // 72% activity rate
      upcomingEvents: mockData.events.filter(
        e => e.status === 'published' && e.eventDate > new Date()
      ).length,
      monthlyDonations: mockData.donations
        .filter(d => {
          const donationMonth = d.donationDate.getMonth();
          const currentMonth = new Date().getMonth();
          return donationMonth === currentMonth && d.status === 'completed';
        })
        .reduce((sum, d) => sum + d.amount, 0),
      trends: {
        alumniGrowth: 8.5 + Math.random() * 8, // 8.5-16.5%
        memberActivity: 5.2 + Math.random() * 6, // 5.2-11.2%
        eventAttendance: -5 + Math.random() * 15, // -5% to +10%
        donationGrowth: 10 + Math.random() * 20, // 10-30%
      },
    };

    return createSuccessResponse(metrics);
  }

  // Get recent activities
  async getRecentActivities(
    limit: number = 10
  ): Promise<MockApiResponse<RecentActivity[]>> {
    await simulateDelay(150, 350);

    if (simulateError(0)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    // Generate dynamic recent activities
    const activities: RecentActivity[] = [];
    let activityId = 1;

    // Recent alumni registrations (last 30 days)
    const recentAlumni = mockData.alumni
      .filter(a => {
        const daysDiff =
          (new Date().getTime() - a.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      })
      .slice(0, 3);

    recentAlumni.forEach(alumni => {
      activities.push({
        id: (activityId++).toString(),
        type: 'new_alumni',
        title: 'New Alumni Registration',
        description: `${alumni.firstName} ${alumni.lastName} (Class of ${alumni.graduationYear}) joined the alumni network`,
        timestamp: alumni.createdAt,
        userId: alumni.id,
      });
    });

    // Recent donations (last 30 days)
    const recentDonations = mockData.donations
      .filter(d => {
        const daysDiff =
          (new Date().getTime() - d.donationDate.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysDiff <= 30 && d.status === 'completed';
      })
      .sort((a, b) => b.donationDate.getTime() - a.donationDate.getTime())
      .slice(0, 5);

    recentDonations.forEach(donation => {
      const donor = mockData.alumni.find(a => a.id === donation.donorId);
      activities.push({
        id: (activityId++).toString(),
        type: 'donation',
        title: 'New Donation Received',
        description: `${donor?.firstName} ${donor?.lastName} donated $${donation.amount.toLocaleString()} to ${donation.purpose}`,
        timestamp: donation.donationDate,
        userId: donation.donorId,
      });
    });

    // Recent events (last 30 days)
    const recentEvents = mockData.events
      .filter(e => {
        const daysDiff =
          (new Date().getTime() - e.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      })
      .slice(0, 3);

    recentEvents.forEach(event => {
      activities.push({
        id: (activityId++).toString(),
        type: 'event_created',
        title: 'Event Created',
        description: `${event.title} scheduled for ${event.eventDate.toLocaleDateString()}`,
        timestamp: event.createdAt,
        userId: event.createdBy,
      });
    });

    // Recent communications
    const recentCommunications = mockData.communications
      .filter(c => c.status === 'sent' && c.sentDate)
      .sort((a, b) => {
        if (!a.sentDate || !b.sentDate) return 0;
        return b.sentDate.getTime() - a.sentDate.getTime();
      })
      .slice(0, 2);

    recentCommunications.forEach(comm => {
      activities.push({
        id: (activityId++).toString(),
        type: 'communication_sent',
        title: 'Communication Sent',
        description: `${comm.title} sent to ${comm.targetAudience.join(', ')} audience`,
        timestamp: comm.sentDate!,
        userId: comm.createdBy,
      });
    });

    // Sort all activities by timestamp and limit
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return createSuccessResponse(sortedActivities);
  }

  // Get chart data for dashboard visualizations
  async getChartData(chartType: string): Promise<MockApiResponse<any>> {
    await simulateDelay(100, 300);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const chartData = (mockChartData as any)[chartType];

    if (!chartData) {
      throw createErrorResponse({
        code: 'NOT_FOUND',
        message: `Chart data for type '${chartType}' not found.`,
      });
    }

    return createSuccessResponse(chartData);
  }

  // Get alumni growth data
  async getAlumniGrowthData(
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<MockApiResponse<Array<{ period: string; count: number }>>> {
    await simulateDelay(150, 300);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    // Generate growth data based on period
    const now = new Date();
    const data: Array<{ period: string; count: number }> = [];

    if (period === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });

        // Simulate growth with some randomness
        const baseCount = 1000 + (11 - i) * 20;
        const count = baseCount + Math.floor(Math.random() * 50);

        data.push({ period: monthStr, count });
      }
    } else if (period === 'quarter') {
      // Last 8 quarters
      for (let i = 7; i >= 0; i--) {
        const quarterStart = new Date(
          now.getFullYear(),
          now.getMonth() - i * 3,
          1
        );
        const quarter = Math.floor(quarterStart.getMonth() / 3) + 1;
        const quarterStr = `Q${quarter} ${quarterStart.getFullYear()}`;

        const baseCount = 900 + (7 - i) * 60;
        const count = baseCount + Math.floor(Math.random() * 100);

        data.push({ period: quarterStr, count });
      }
    } else {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const baseCount = 600 + (4 - i) * 150;
        const count = baseCount + Math.floor(Math.random() * 200);

        data.push({ period: year.toString(), count });
      }
    }

    return createSuccessResponse(data);
  }

  // Get donation trends data
  async getDonationTrends(
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<
    MockApiResponse<Array<{ period: string; amount: number; count: number }>>
  > {
    await simulateDelay(150, 300);

    if (simulateError(0)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const now = new Date();
    const data: Array<{ period: string; amount: number; count: number }> = [];

    if (period === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });

        const baseAmount = 8000 + Math.random() * 10000;
        const baseCount = 15 + Math.floor(Math.random() * 25);

        data.push({
          period: monthStr,
          amount: Math.round(baseAmount),
          count: baseCount,
        });
      }
    }

    return createSuccessResponse(data);
  }

  // Get event attendance data
  async getEventAttendanceData(): Promise<
    MockApiResponse<
      Array<{
        eventName: string;
        registered: number;
        attended: number;
        capacity: number;
      }>
    >
  > {
    await simulateDelay(100, 250);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    // Get recent completed events with attendance data
    const completedEvents = mockData.events
      .filter(e => e.status === 'completed')
      .slice(0, 10)
      .map(event => {
        const registrations = mockData.eventRegistrations.filter(
          r => r.eventId === event.id
        );
        const registered = registrations.filter(
          r => r.status === 'registered' || r.status === 'attended'
        ).length;
        const attended = registrations.filter(
          r => r.status === 'attended'
        ).length;

        return {
          eventName:
            event.title.length > 20
              ? event.title.substring(0, 20) + '...'
              : event.title,
          registered,
          attended,
          capacity: event.capacity,
        };
      });

    return createSuccessResponse(completedEvents);
  }

  // Get summary statistics
  async getSummaryStats(): Promise<
    MockApiResponse<{
      totalAlumni: number;
      totalDonations: number;
      totalEvents: number;
      totalCommunications: number;
      growthRates: {
        alumni: number;
        donations: number;
        events: number;
      };
    }>
  > {
    await simulateDelay(200, 400);

    if (simulateError(0.01)) {
      throw createErrorResponse(mockErrors.NETWORK_ERROR);
    }

    const stats = {
      totalAlumni: mockData.alumni.length,
      totalDonations: mockData.donations.filter(d => d.status === 'completed')
        .length,
      totalEvents: mockData.events.length,
      totalCommunications: mockData.communications.filter(
        c => c.status === 'sent'
      ).length,
      growthRates: {
        alumni: 12.5 + Math.random() * 5, // 12.5-17.5%
        donations: 18.3 + Math.random() * 10, // 18.3-28.3%
        events: 8.7 + Math.random() * 6, // 8.7-14.7%
      },
    };

    return createSuccessResponse(stats);
  }
}

export const mockDashboardService = new MockDashboardService();
