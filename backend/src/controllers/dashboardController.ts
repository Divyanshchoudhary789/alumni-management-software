import { Request, Response } from 'express';
import { User } from '../models/User';
import { AlumniProfile } from '../models/AlumniProfile';
import { Event, EventRegistration } from '../models/Event';
import { Donation } from '../models/Donation';
import { MentorshipConnection } from '../models/Mentorship';
import { logger } from '../config/logger';
import { cacheService } from '../services/cacheService';

interface DashboardMetrics {
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

interface RecentActivity {
  id: string;
  type: 'new_alumni' | 'event_created' | 'donation' | 'mentorship';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
}

/**
 * Get dashboard metrics with caching
 */
export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'dashboard:metrics';
    
    // Try to get from cache first
    const cachedMetrics = await cacheService.get(cacheKey);
    if (cachedMetrics) {
      logger.info('Dashboard metrics served from cache');
      res.json(cachedMetrics);
      return;
    }

    // Calculate current month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel aggregation queries for better performance
    const [
      totalAlumni,
      activeMembers,
      upcomingEvents,
      monthlyDonations,
      lastMonthAlumni,
      lastMonthDonations,
      eventAttendanceStats
    ] = await Promise.all([
      // Total alumni count
      AlumniProfile.countDocuments({ isPublic: true }),
      
      // Active members (logged in within last 30 days)
      User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Upcoming events count
      Event.countDocuments({
        status: 'published',
        eventDate: { $gte: now }
      }),
      
      // Current month donations total
      Donation.aggregate([
        {
          $match: {
            status: 'completed',
            donationDate: { $gte: currentMonthStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // Last month alumni count for growth calculation
      AlumniProfile.countDocuments({
        createdAt: { $lt: currentMonthStart }
      }),
      
      // Last month donations for growth calculation
      Donation.aggregate([
        {
          $match: {
            status: 'completed',
            donationDate: { $gte: lastMonthStart, $lt: currentMonthStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // Event attendance statistics for trend calculation
      EventRegistration.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $unwind: '$event'
        },
        {
          $match: {
            'event.eventDate': { $gte: lastMonthStart },
            status: 'attended'
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$event.eventDate' },
              year: { $year: '$event.eventDate' }
            },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Calculate trends
    const currentMonthDonationTotal = monthlyDonations[0]?.total || 0;
    const lastMonthDonationTotal = lastMonthDonations[0]?.total || 0;
    
    const alumniGrowth = lastMonthAlumni > 0 
      ? ((totalAlumni - lastMonthAlumni) / lastMonthAlumni) * 100 
      : 0;
    
    const donationGrowth = lastMonthDonationTotal > 0 
      ? ((currentMonthDonationTotal - lastMonthDonationTotal) / lastMonthDonationTotal) * 100 
      : 0;

    // Calculate member activity trend (simplified - based on recent logins)
    const memberActivity = activeMembers > 0 ? (activeMembers / totalAlumni) * 100 : 0;

    // Calculate event attendance trend
    const currentMonthAttendance = eventAttendanceStats.find(
      (stat: any) => stat._id.month === now.getMonth() + 1 && stat._id.year === now.getFullYear()
    )?.count || 0;
    
    const lastMonthAttendance = eventAttendanceStats.find(
      (stat: any) => stat._id.month === lastMonthStart.getMonth() + 1 && stat._id.year === lastMonthStart.getFullYear()
    )?.count || 0;
    
    const eventAttendance = lastMonthAttendance > 0 
      ? ((currentMonthAttendance - lastMonthAttendance) / lastMonthAttendance) * 100 
      : 0;

    const metrics: DashboardMetrics = {
      totalAlumni,
      activeMembers,
      upcomingEvents,
      monthlyDonations: currentMonthDonationTotal,
      trends: {
        alumniGrowth: Math.round(alumniGrowth * 100) / 100,
        memberActivity: Math.round(memberActivity * 100) / 100,
        eventAttendance: Math.round(eventAttendance * 100) / 100,
        donationGrowth: Math.round(donationGrowth * 100) / 100,
      },
    };

    // Cache the metrics for 5 minutes
    await cacheService.set(cacheKey, metrics, 300);

    logger.info('Dashboard metrics calculated and cached');
    res.json(metrics);

  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch dashboard metrics',
        code: 'DASHBOARD_METRICS_ERROR'
      }
    });
  }
};

/**
 * Get alumni growth chart data
 */
export const getAlumniGrowthData = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = req.query.period as string || 'month';
    const cacheKey = `dashboard:alumni-growth:${period}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      logger.info('Alumni growth data served from cache');
      res.json(cachedData);
      return;
    }

    let dateFormat: any;
    let groupBy: any;
    let startDate: Date;

    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 7 * 24 * 60 * 60 * 1000); // 7 weeks
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 2, 0, 1); // 2 years
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 12 months
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }

    const growthData = await AlumniProfile.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate growth percentages
    const result = growthData.map((item, index) => ({
      date: item._id,
      count: item.count,
      growth: index > 0 ? ((item.count - growthData[index - 1].count) / growthData[index - 1].count) * 100 : 0
    }));

    // Cache for 10 minutes
    await cacheService.set(cacheKey, result, 600);
    
    logger.info('Alumni growth data calculated and cached');
    res.json(result);

  } catch (error) {
    logger.error('Error fetching alumni growth data:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch alumni growth data',
        code: 'ALUMNI_GROWTH_ERROR'
      }
    });
  }
};

/**
 * Get event attendance chart data
 */
export const getEventAttendanceData = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = req.query.period as string || 'month';
    const cacheKey = `dashboard:event-attendance:${period}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      logger.info('Event attendance data served from cache');
      res.json(cachedData);
      return;
    }

    let startDate: Date;
    let groupBy: any;

    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 7 * 24 * 60 * 60 * 1000); // 7 weeks
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$eventDate" } };
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 2, 0, 1); // 2 years
        groupBy = { $dateToString: { format: "%Y-%m", date: "$eventDate" } };
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 12 months
        groupBy = { $dateToString: { format: "%Y-%m", date: "$eventDate" } };
    }

    const attendanceData = await Event.aggregate([
      {
        $match: {
          eventDate: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'eventregistrations',
          localField: '_id',
          foreignField: 'eventId',
          as: 'registrations'
        }
      },
      {
        $group: {
          _id: groupBy,
          events: { $sum: 1 },
          registrations: { $sum: { $size: '$registrations' } },
          attendance: {
            $sum: {
              $size: {
                $filter: {
                  input: '$registrations',
                  cond: { $eq: ['$$this.status', 'attended'] }
                }
              }
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Cache for 10 minutes
    await cacheService.set(cacheKey, attendanceData, 600);
    
    logger.info('Event attendance data calculated and cached');
    res.json(attendanceData.map(item => ({
      date: item._id,
      events: item.events,
      registrations: item.registrations,
      attendance: item.attendance
    })));

  } catch (error) {
    logger.error('Error fetching event attendance data:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch event attendance data',
        code: 'EVENT_ATTENDANCE_ERROR'
      }
    });
  }
};

/**
 * Get donation trends chart data
 */
export const getDonationTrendsData = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = req.query.period as string || 'month';
    const cacheKey = `dashboard:donation-trends:${period}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      logger.info('Donation trends data served from cache');
      res.json(cachedData);
      return;
    }

    let startDate: Date;
    let groupBy: any;

    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 7 * 24 * 60 * 60 * 1000); // 7 weeks
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$donationDate" } };
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 2, 0, 1); // 2 years
        groupBy = { $dateToString: { format: "%Y-%m", date: "$donationDate" } };
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 12 months
        groupBy = { $dateToString: { format: "%Y-%m", date: "$donationDate" } };
    }

    const donationData = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          donationDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate averages and format result
    const result = donationData.map(item => ({
      date: item._id,
      amount: item.amount,
      count: item.count,
      average: item.count > 0 ? item.amount / item.count : 0
    }));

    // Cache for 10 minutes
    await cacheService.set(cacheKey, result, 600);
    
    logger.info('Donation trends data calculated and cached');
    res.json(result);

  } catch (error) {
    logger.error('Error fetching donation trends data:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch donation trends data',
        code: 'DONATION_TRENDS_ERROR'
      }
    });
  }
};

/**
 * Get recent activities with caching
 */
export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cacheKey = `dashboard:activities:${limit}`;
    
    // Try to get from cache first
    const cachedActivities = await cacheService.get(cacheKey);
    if (cachedActivities) {
      logger.info('Recent activities served from cache');
      res.json(cachedActivities);
      return;
    }

    const activities: RecentActivity[] = [];

    // Get recent alumni registrations
    const recentAlumni = await AlumniProfile.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    recentAlumni.forEach((alumni: any) => {
      activities.push({
        id: alumni._id.toString(),
        type: 'new_alumni',
        title: 'New Alumni Joined',
        description: `${alumni.firstName} ${alumni.lastName} joined the alumni network`,
        timestamp: alumni.createdAt,
        userId: alumni.userId._id.toString()
      });
    });

    // Get recent events
    const recentEvents = await Event.find()
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    recentEvents.forEach((event: any) => {
      activities.push({
        id: event._id.toString(),
        type: 'event_created',
        title: 'New Event Created',
        description: `Event "${event.title}" scheduled for ${new Date(event.eventDate).toLocaleDateString()}`,
        timestamp: event.createdAt,
        userId: event.createdBy._id.toString()
      });
    });

    // Get recent donations
    const recentDonations = await Donation.find({ status: 'completed' })
      .populate({
        path: 'donorId',
        select: 'firstName lastName'
      })
      .sort({ donationDate: -1 })
      .limit(5)
      .lean();

    recentDonations.forEach((donation: any) => {
      activities.push({
        id: donation._id.toString(),
        type: 'donation',
        title: 'New Donation Received',
        description: `$${donation.amount} donated by ${donation.donorId.firstName} ${donation.donorId.lastName} for ${donation.purpose}`,
        timestamp: donation.donationDate,
        userId: donation.donorId._id.toString()
      });
    });

    // Get recent mentorship connections
    const recentMentorships = await MentorshipConnection.find()
      .populate({
        path: 'mentorId',
        populate: {
          path: 'alumniId',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'menteeId',
        populate: {
          path: 'alumniId',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    recentMentorships.forEach((mentorship: any) => {
      if (mentorship.mentorId?.alumniId && mentorship.menteeId?.alumniId) {
        activities.push({
          id: mentorship._id.toString(),
          type: 'mentorship',
          title: 'New Mentorship Connection',
          description: `${mentorship.mentorId.alumniId.firstName} ${mentorship.mentorId.alumniId.lastName} connected with ${mentorship.menteeId.alumniId.firstName} ${mentorship.menteeId.alumniId.lastName}`,
          timestamp: mentorship.createdAt,
          userId: mentorship.mentorId.alumniId._id.toString()
        });
      }
    });

    // Sort all activities by timestamp and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    // Cache the activities for 2 minutes
    await cacheService.set(cacheKey, sortedActivities, 120);

    logger.info(`Recent activities fetched and cached (${sortedActivities.length} items)`);
    res.json(sortedActivities);

  } catch (error) {
    logger.error('Error fetching recent activities:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch recent activities',
        code: 'RECENT_ACTIVITIES_ERROR'
      }
    });
  }
};