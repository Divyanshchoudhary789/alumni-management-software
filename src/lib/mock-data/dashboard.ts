import { DashboardMetrics, RecentActivity } from '@/types';

export const mockDashboardMetrics: DashboardMetrics = {
  totalAlumni: 1247,
  activeMembers: 892,
  upcomingEvents: 8,
  monthlyDonations: 15750,
  trends: {
    alumniGrowth: 12.5, // 12.5% increase
    memberActivity: 8.3, // 8.3% increase
    eventAttendance: -2.1, // 2.1% decrease
    donationGrowth: 23.7, // 23.7% increase
  },
};

export const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'new_alumni',
    title: 'New Alumni Registration',
    description: 'Jessica Park (Class of 2021) joined the alumni network',
    timestamp: new Date('2024-02-20T10:30:00'),
    userId: '5',
  },
  {
    id: '2',
    type: 'donation',
    title: 'New Donation Received',
    description: 'David Thompson donated $2,500 to Infrastructure Development',
    timestamp: new Date('2024-02-19T14:15:00'),
    userId: '4',
  },
  {
    id: '3',
    type: 'event_created',
    title: 'Event Created',
    description: 'Alumni Startup Showcase scheduled for April 10, 2024',
    timestamp: new Date('2024-02-18T09:45:00'),
    userId: 'admin_2',
  },
  {
    id: '4',
    type: 'mentorship',
    title: 'Mentorship Connection',
    description: 'Sarah Johnson connected as mentor with recent graduate',
    timestamp: new Date('2024-02-17T16:20:00'),
    userId: '1',
  },
  {
    id: '5',
    type: 'event_registration',
    title: 'Event Registration',
    description: '15 new registrations for Annual Alumni Gala',
    timestamp: new Date('2024-02-16T11:00:00'),
  },
  {
    id: '6',
    type: 'communication_sent',
    title: 'Newsletter Sent',
    description: 'February newsletter sent to 1,200+ alumni',
    timestamp: new Date('2024-02-15T08:30:00'),
    userId: 'admin_1',
  },
  {
    id: '7',
    type: 'donation',
    title: 'Major Donation',
    description: 'Anonymous donor contributed $5,000 to Scholarship Fund',
    timestamp: new Date('2024-02-14T13:45:00'),
  },
  {
    id: '8',
    type: 'profile_update',
    title: 'Profile Updates',
    description: '8 alumni updated their professional information',
    timestamp: new Date('2024-02-13T15:30:00'),
  },
];

// Chart data for dashboard visualizations
export const mockChartData = {
  alumniGrowth: [
    { month: 'Jan 2023', count: 1089 },
    { month: 'Feb 2023', count: 1098 },
    { month: 'Mar 2023', count: 1112 },
    { month: 'Apr 2023', count: 1125 },
    { month: 'May 2023', count: 1134 },
    { month: 'Jun 2023', count: 1148 },
    { month: 'Jul 2023', count: 1156 },
    { month: 'Aug 2023', count: 1167 },
    { month: 'Sep 2023', count: 1178 },
    { month: 'Oct 2023', count: 1189 },
    { month: 'Nov 2023', count: 1203 },
    { month: 'Dec 2023', count: 1218 },
    { month: 'Jan 2024', count: 1235 },
    { month: 'Feb 2024', count: 1247 },
  ],

  eventAttendance: [
    { event: 'Tech Panel Q4', registered: 85, attended: 78 },
    { event: 'Holiday Mixer', registered: 120, attended: 95 },
    { event: 'Career Workshop', registered: 65, attended: 58 },
    { event: 'Networking Event', registered: 90, attended: 82 },
    { event: 'Industry Panel', registered: 110, attended: 98 },
  ],

  donationTrends: [
    { month: 'Jan 2023', amount: 8500 },
    { month: 'Feb 2023', amount: 9200 },
    { month: 'Mar 2023', amount: 11800 },
    { month: 'Apr 2023', amount: 7600 },
    { month: 'May 2023', amount: 10400 },
    { month: 'Jun 2023', amount: 13200 },
    { month: 'Jul 2023', amount: 9800 },
    { month: 'Aug 2023', amount: 8900 },
    { month: 'Sep 2023', amount: 12100 },
    { month: 'Oct 2023', count: 10700 },
    { month: 'Nov 2023', amount: 14500 },
    { month: 'Dec 2023', amount: 18900 },
    { month: 'Jan 2024', amount: 12300 },
    { month: 'Feb 2024', amount: 15750 },
  ],

  memberActivity: [
    { category: 'Profile Updates', count: 156 },
    { category: 'Event Participation', count: 234 },
    { category: 'Networking Connections', count: 89 },
    { category: 'Mentorship Activities', count: 45 },
    { category: 'Forum Posts', count: 78 },
    { category: 'Job Board Usage', count: 123 },
  ],

  graduationYearDistribution: [
    { year: '2015-2017', count: 245 },
    { year: '2018-2020', count: 387 },
    { year: '2021-2023', count: 615 },
  ],

  industryDistribution: [
    { industry: 'Technology', count: 425 },
    { industry: 'Finance', count: 198 },
    { industry: 'Healthcare', count: 156 },
    { industry: 'Education', count: 134 },
    { industry: 'Consulting', count: 112 },
    { industry: 'Manufacturing', count: 89 },
    { industry: 'Other', count: 133 },
  ],

  locationDistribution: [
    { location: 'San Francisco Bay Area', count: 312 },
    { location: 'New York Metro', count: 245 },
    { location: 'Los Angeles', count: 156 },
    { location: 'Seattle', count: 134 },
    { location: 'Boston', count: 123 },
    { location: 'Chicago', count: 98 },
    { location: 'Austin', count: 87 },
    { location: 'Other US', count: 92 },
  ],
};

// Generate dynamic dashboard metrics based on current data
export const generateDashboardMetrics = (
  alumniCount: number,
  eventsData: any[],
  donationsData: any[]
): DashboardMetrics => {
  const activeEvents = eventsData.filter(e => e.status === 'published').length;
  const currentMonthDonations = donationsData
    .filter(d => {
      const donationMonth = d.donationDate.getMonth();
      const currentMonth = new Date().getMonth();
      return donationMonth === currentMonth && d.status === 'completed';
    })
    .reduce((sum, d) => sum + d.amount, 0);

  // Calculate active members (those who have activity in last 6 months)
  const activeMembers = Math.floor(alumniCount * 0.72); // Assume 72% activity rate

  return {
    totalAlumni: alumniCount,
    activeMembers,
    upcomingEvents: activeEvents,
    monthlyDonations: currentMonthDonations,
    trends: {
      alumniGrowth: 8.5 + Math.random() * 8, // 8.5-16.5%
      memberActivity: 5.2 + Math.random() * 6, // 5.2-11.2%
      eventAttendance: -5 + Math.random() * 15, // -5% to +10%
      donationGrowth: 10 + Math.random() * 20, // 10-30%
    },
  };
};

// Generate recent activities based on data
export const generateRecentActivities = (
  alumni: any[],
  events: any[],
  donations: any[]
): RecentActivity[] => {
  const activities: RecentActivity[] = [];
  let activityId = 1;

  // Recent alumni registrations
  const recentAlumni = alumni
    .filter(a => {
      const daysDiff =
        (new Date().getTime() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24);
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

  // Recent donations
  const recentDonations = donations
    .filter(d => {
      const daysDiff =
        (new Date().getTime() - d.donationDate.getTime()) /
        (1000 * 60 * 60 * 24);
      return daysDiff <= 30 && d.status === 'completed';
    })
    .sort((a, b) => b.donationDate.getTime() - a.donationDate.getTime())
    .slice(0, 5);

  recentDonations.forEach(donation => {
    const donor = alumni.find(a => a.id === donation.donorId);
    activities.push({
      id: (activityId++).toString(),
      type: 'donation',
      title: 'New Donation Received',
      description: `${donor?.firstName} ${donor?.lastName} donated $${donation.amount.toLocaleString()} to ${donation.purpose}`,
      timestamp: donation.donationDate,
      userId: donation.donorId,
    });
  });

  // Recent events
  const recentEvents = events
    .filter(e => {
      const daysDiff =
        (new Date().getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
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

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);
};
