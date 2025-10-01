import { MentorshipConnection } from '@/types';

export const mockMentorshipConnections: MentorshipConnection[] = [
  {
    id: '1',
    mentorId: '1', // Sarah Johnson
    menteeId: '5', // Jessica Park
    status: 'active',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-07-15'),
    notes:
      'Focus on career transition from data science to software engineering. Monthly meetings scheduled.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '2',
    mentorId: '2', // Michael Chen
    menteeId: '6', // Generated alumni
    status: 'active',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-01'),
    notes:
      'Business strategy and consulting career guidance. Bi-weekly virtual meetings.',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    mentorId: '4', // David Thompson
    menteeId: '7', // Generated alumni
    status: 'completed',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2024-02-01'),
    notes:
      'Engineering career development completed successfully. Mentee secured position at automotive company.',
    createdAt: new Date('2023-07-20'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    mentorId: '3', // Emily Rodriguez
    menteeId: '8', // Generated alumni
    status: 'pending',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-09-01'),
    notes: 'Marketing career transition. Waiting for mentee confirmation.',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-18'),
  },
  {
    id: '5',
    mentorId: '1', // Sarah Johnson
    menteeId: '9', // Generated alumni
    status: 'paused',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2024-04-01'),
    notes:
      "Temporarily paused due to mentor's work commitments. Will resume in March.",
    createdAt: new Date('2023-09-20'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Mentor profiles with specializations
export const mockMentorProfiles = [
  {
    alumniId: '1',
    specializations: [
      'Software Engineering',
      'Career Transition',
      'Technical Leadership',
    ],
    industries: ['Technology', 'Startups'],
    yearsOfExperience: 6,
    maxMentees: 3,
    currentMentees: 2,
    availability: 'Available',
    preferredMeetingFrequency: 'Bi-weekly',
    communicationPreference: 'Video calls',
    bio: 'Experienced software engineer passionate about helping others navigate tech careers.',
    isActive: true,
    mentorshipType: 'free',
  },
  {
    alumniId: '2',
    specializations: [
      'Business Strategy',
      'Consulting',
      'Leadership Development',
    ],
    industries: ['Consulting', 'Finance', 'Technology'],
    yearsOfExperience: 4,
    maxMentees: 2,
    currentMentees: 1,
    availability: 'Available',
    preferredMeetingFrequency: 'Monthly',
    communicationPreference: 'Video calls + messaging',
    bio: 'Management consultant helping professionals develop strategic thinking and leadership skills.',
    isActive: true,
    mentorshipType: 'paid',
    hourlyRate: 150,
    sessionRate: 200,
    monthlyRate: 800,
    paymentMethods: ['stripe', 'paypal'],
  },
  {
    alumniId: '3',
    specializations: [
      'Product Marketing',
      'Growth Strategy',
      'Content Creation',
    ],
    industries: ['SaaS', 'Technology', 'Marketing'],
    yearsOfExperience: 5,
    maxMentees: 2,
    currentMentees: 1,
    availability: 'Limited',
    preferredMeetingFrequency: 'Monthly',
    communicationPreference: 'Video calls',
    bio: 'Product marketing expert specializing in SaaS growth and customer acquisition.',
    isActive: true,
    mentorshipType: 'both',
    hourlyRate: 120,
    sessionRate: 180,
    monthlyRate: 600,
    paymentMethods: ['stripe'],
  },
  {
    alumniId: '4',
    specializations: [
      'Engineering Design',
      'Project Management',
      'Manufacturing',
    ],
    industries: ['Automotive', 'Manufacturing', 'Clean Energy'],
    yearsOfExperience: 7,
    maxMentees: 2,
    currentMentees: 0,
    availability: 'Available',
    preferredMeetingFrequency: 'Bi-weekly',
    communicationPreference: 'Video calls',
    bio: 'Senior design engineer with expertise in automotive and clean energy sectors.',
    isActive: true,
    mentorshipType: 'free',
  },
  {
    alumniId: '5',
    specializations: [
      'Data Science',
      'Machine Learning',
      'AI Ethics',
    ],
    industries: ['Technology', 'Healthcare', 'Finance'],
    yearsOfExperience: 8,
    maxMentees: 3,
    currentMentees: 1,
    availability: 'Available',
    preferredMeetingFrequency: 'Weekly',
    communicationPreference: 'Video calls',
    bio: 'Senior data scientist with expertise in ML applications across various industries.',
    isActive: true,
    mentorshipType: 'paid',
    hourlyRate: 180,
    sessionRate: 250,
    monthlyRate: 1000,
    paymentMethods: ['stripe', 'paypal'],
  },
  {
    alumniId: '6',
    specializations: [
      'UX/UI Design',
      'Product Design',
      'Design Systems',
    ],
    industries: ['Technology', 'E-commerce', 'SaaS'],
    yearsOfExperience: 5,
    maxMentees: 2,
    currentMentees: 0,
    availability: 'Available',
    preferredMeetingFrequency: 'Bi-weekly',
    communicationPreference: 'Video calls + messaging',
    bio: 'Product designer passionate about creating intuitive user experiences.',
    isActive: true,
    mentorshipType: 'both',
    hourlyRate: 100,
    sessionRate: 150,
    monthlyRate: 500,
    paymentMethods: ['stripe'],
  },
  {
    alumniId: '7',
    specializations: [
      'DevOps',
      'Cloud Architecture',
      'Infrastructure',
    ],
    industries: ['Technology', 'Cloud Computing', 'Startups'],
    yearsOfExperience: 6,
    maxMentees: 2,
    currentMentees: 1,
    availability: 'Limited',
    preferredMeetingFrequency: 'Monthly',
    communicationPreference: 'Video calls',
    bio: 'DevOps engineer helping teams build scalable and reliable infrastructure.',
    isActive: true,
    mentorshipType: 'free',
  },
  {
    alumniId: '8',
    specializations: [
      'Digital Marketing',
      'SEO',
      'Content Strategy',
    ],
    industries: ['Marketing', 'E-commerce', 'Media'],
    yearsOfExperience: 4,
    maxMentees: 3,
    currentMentees: 2,
    availability: 'Available',
    preferredMeetingFrequency: 'Weekly',
    communicationPreference: 'Video calls + messaging',
    bio: 'Digital marketing specialist focused on organic growth and content strategy.',
    isActive: true,
    mentorshipType: 'paid',
    hourlyRate: 90,
    sessionRate: 130,
    monthlyRate: 400,
    paymentMethods: ['stripe', 'paypal'],
  },
];

// Mentee requests and profiles
export const mockMenteeRequests = [
  {
    id: '1',
    alumniId: '10',
    requestedSpecializations: ['Software Engineering', 'Career Change'],
    careerGoals: 'Transition from marketing to software development',
    currentSituation: 'Currently learning programming through bootcamp',
    preferredMentorIndustries: ['Technology', 'Startups'],
    timeCommitment: 'Bi-weekly meetings',
    status: 'pending',
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-18'),
  },
  {
    id: '2',
    alumniId: '11',
    requestedSpecializations: ['Business Strategy', 'Entrepreneurship'],
    careerGoals: 'Start my own consulting business',
    currentSituation: 'Working as business analyst, planning to go independent',
    preferredMentorIndustries: ['Consulting', 'Entrepreneurship'],
    timeCommitment: 'Monthly meetings',
    status: 'matched',
    matchedMentorId: '2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    alumniId: '12',
    requestedSpecializations: ['Data Science', 'Machine Learning'],
    careerGoals: 'Advance to senior data scientist role',
    currentSituation:
      'Junior data scientist looking for career advancement guidance',
    preferredMentorIndustries: ['Technology', 'AI/ML'],
    timeCommitment: 'Bi-weekly meetings',
    status: 'pending',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
];

// Generate additional mentorship connections
export const generateMockMentorshipConnections = (
  count: number = 20,
  mentorIds: string[],
  menteeIds: string[]
): MentorshipConnection[] => {
  const statuses: Array<
    'active' | 'completed' | 'pending' | 'paused' | 'cancelled'
  > = ['active', 'completed', 'pending', 'paused', 'cancelled'];

  const additionalConnections: MentorshipConnection[] = [];

  for (let i = 6; i <= count + 5; i++) {
    const mentorId = mentorIds[Math.floor(Math.random() * mentorIds.length)];
    const menteeId = menteeIds[Math.floor(Math.random() * menteeIds.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate realistic dates based on status
    let startDate: Date;
    let endDate: Date;

    if (status === 'completed') {
      startDate = new Date(
        2023,
        3 + Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 28) + 1
      );
      endDate = new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 months later
    } else if (status === 'active' || status === 'paused') {
      startDate = new Date(
        2023,
        6 + Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 28) + 1
      );
      endDate = new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(
        2024,
        2 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 28) + 1
      );
      endDate = new Date(startDate.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    }

    const createdAt = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before start

    additionalConnections.push({
      id: i.toString(),
      mentorId,
      menteeId,
      status,
      startDate,
      endDate,
      notes: `Mentorship connection ${i} - ${status} status`,
      createdAt,
      updatedAt: new Date(),
    });
  }

  return [...mockMentorshipConnections, ...additionalConnections];
};

// Mentorship program statistics
export const calculateMentorshipStats = (
  connections: MentorshipConnection[]
) => {
  const active = connections.filter(c => c.status === 'active').length;
  const completed = connections.filter(c => c.status === 'completed').length;
  const pending = connections.filter(c => c.status === 'pending').length;
  const paused = connections.filter(c => c.status === 'paused').length;

  const totalConnections = connections.length;
  const successRate =
    totalConnections > 0 ? (completed / totalConnections) * 100 : 0;

  // Calculate average duration for completed mentorships
  const completedConnections = connections.filter(
    c => c.status === 'completed'
  );
  const averageDuration =
    completedConnections.length > 0
      ? completedConnections.reduce((sum, c) => {
          const duration =
            (c.endDate.getTime() - c.startDate.getTime()) /
            (1000 * 60 * 60 * 24);
          return sum + duration;
        }, 0) / completedConnections.length
      : 0;

  return {
    totalConnections,
    active,
    completed,
    pending,
    paused,
    successRate: Math.round(successRate * 100) / 100,
    averageDurationDays: Math.round(averageDuration),
  };
};

// Matching algorithm simulation
export const suggestMentorMatches = (
  menteeRequest: any,
  mentorProfiles: any[]
) => {
  const availableMentors = mentorProfiles.filter(
    m => m.isActive && m.currentMentees < m.maxMentees
  );

  const scoredMatches = availableMentors.map(mentor => {
    let score = 0;

    // Specialization match
    const specializationMatch = mentor.specializations.some(spec =>
      menteeRequest.requestedSpecializations.some(
        (reqSpec: string) =>
          spec.toLowerCase().includes(reqSpec.toLowerCase()) ||
          reqSpec.toLowerCase().includes(spec.toLowerCase())
      )
    );
    if (specializationMatch) score += 40;

    // Industry match
    const industryMatch = mentor.industries.some((industry: string) =>
      menteeRequest.preferredMentorIndustries.includes(industry)
    );
    if (industryMatch) score += 30;

    // Availability match
    if (mentor.availability === 'Available') score += 20;
    else if (mentor.availability === 'Limited') score += 10;

    // Experience bonus
    if (mentor.yearsOfExperience >= 5) score += 10;

    return {
      mentorId: mentor.alumniId,
      score,
      matchReasons: [
        specializationMatch && 'Specialization match',
        industryMatch && 'Industry experience',
        mentor.availability === 'Available' && 'Available for mentoring',
      ].filter(Boolean),
    };
  });

  return scoredMatches.sort((a, b) => b.score - a.score).slice(0, 3); // Top 3 matches
};
