// Global type definitions
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'alumni';
  createdAt: Date;
  updatedAt: Date;
}

export interface AlumniProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  graduationYear: number;
  degree: string;
  currentCompany?: string;
  currentPosition?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  phone?: string;
  isPublic: boolean;
  skills: string[];
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  capacity: number;
  registrationDeadline: Date;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  eventType?: 'free' | 'paid';
  ticketPrice?: number;
  paymentMethods?: string[];
  imageUrl?: string;
  createdBy: string;
  registrations: EventRegistration[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  alumniId: string;
  registrationDate: Date;
  status: 'registered' | 'attended' | 'cancelled';
}

export interface Donation {
  id: string;
  donorId: string;
  amount: number;
  donationDate: Date;
  purpose: string;
  campaignId: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Communication {
  id: string;
  title: string;
  content: string;
  type: string;
  targetAudience: string[];
  sentDate: Date | null;
  createdBy: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

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
    | 'event_registration'
    | 'communication_sent'
    | 'profile_update';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
}

export interface MentorshipConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'active' | 'completed' | 'pending' | 'paused' | 'cancelled';
  startDate: Date;
  endDate: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorProfile {
  alumniId: string;
  specializations: string[];
  industries: string[];
  yearsOfExperience: number;
  maxMentees: number;
  currentMentees: number;
  availability: 'Available' | 'Limited' | 'Unavailable';
  preferredMeetingFrequency: string;
  communicationPreference: string;
  bio: string;
  isActive: boolean;
  mentorshipType?: 'free' | 'paid' | 'both';
  hourlyRate?: number;
  sessionRate?: number;
  monthlyRate?: number;
  paymentMethods?: string[];
  mentorshipAreas?: string[];
  timeZone?: string;
  linkedinProfile?: string;
  personalWebsite?: string;
}

export interface MenteeRequest {
  id: string;
  alumniId: string;
  requestedSpecializations: string[];
  careerGoals: string;
  currentSituation: string;
  preferredMentorIndustries: string[];
  timeCommitment: string;
  communicationPreference?: string;
  specificChallenges?: string[];
  desiredOutcomes?: string[];
  timeZone?: string;
  availabilityDays?: string[];
  availabilityTimes?: string[];
  mentorshipDuration?: string;
  previousMentorshipExperience?: boolean;
  additionalNotes?: string;
  status: 'pending' | 'matched' | 'rejected';
  matchedMentorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSettings {
  id: string;
  organizationName: string;
  organizationLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  notificationSettings: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    defaultNotificationFrequency: 'immediate' | 'daily' | 'weekly';
  };
  integrationSettings: {
    googleOAuth: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
    };
    linkedinOAuth: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
    };
    paymentProcessor: {
      provider: 'stripe' | 'paypal' | 'none';
      publicKey?: string;
      secretKey?: string;
    };
  };
  systemPreferences: {
    defaultTimeZone: string;
    dateFormat: string;
    currency: string;
    language: string;
    maintenanceMode: boolean;
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
  };
  updatedAt: Date;
  updatedBy: string;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissions: {
    alumni: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    events: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      manageRegistrations: boolean;
    };
    communications: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      send: boolean;
    };
    donations: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      viewReports: boolean;
    };
    mentorship: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      manageConnections: boolean;
    };
    analytics: {
      view: boolean;
      export: boolean;
      viewSensitiveData: boolean;
    };
    settings: {
      view: boolean;
      edit: boolean;
      manageUsers: boolean;
      manageIntegrations: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
