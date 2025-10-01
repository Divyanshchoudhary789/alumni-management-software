import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../config/logger';
import { User } from '../models/User';
import { AlumniProfile } from '../models/AlumniProfile';
import { Event, EventRegistration } from '../models/Event';
import { Communication, CommunicationTemplate } from '../models/Communication';
import { Donation, Campaign } from '../models/Donation';
import { MentorProfile, MenteeProfile, MentorshipConnection } from '../models/Mentorship';

// Sample data generators
const generateUsers = () => [
  {
    clerkUserId: 'user_admin_001',
    email: 'admin@alumni.edu',
    role: 'admin',
    oauthProvider: 'google'
  },
  {
    clerkUserId: 'user_alumni_001',
    email: 'john.doe@gmail.com',
    role: 'alumni',
    oauthProvider: 'google'
  },
  {
    clerkUserId: 'user_alumni_002',
    email: 'jane.smith@linkedin.com',
    role: 'alumni',
    oauthProvider: 'linkedin'
  },
  {
    clerkUserId: 'user_alumni_003',
    email: 'mike.johnson@gmail.com',
    role: 'alumni',
    oauthProvider: 'google'
  },
  {
    clerkUserId: 'user_alumni_004',
    email: 'sarah.wilson@gmail.com',
    role: 'alumni',
    oauthProvider: 'google'
  },
  {
    clerkUserId: 'user_alumni_005',
    email: 'david.brown@linkedin.com',
    role: 'alumni',
    oauthProvider: 'linkedin'
  }
];

const generateAlumniProfiles = (users: any[]) => [
  {
    userId: users[1]._id, // John Doe
    firstName: 'John',
    lastName: 'Doe',
    graduationYear: 2018,
    degree: 'Computer Science',
    currentCompany: 'Google',
    currentPosition: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    bio: 'Passionate software engineer with 5+ years of experience in full-stack development. Love mentoring junior developers.',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    websiteUrl: 'https://johndoe.dev',
    phone: '+1-555-0101',
    isPublic: true,
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS'],
    interests: ['Machine Learning', 'Open Source', 'Mentoring']
  },
  {
    userId: users[2]._id, // Jane Smith
    firstName: 'Jane',
    lastName: 'Smith',
    graduationYear: 2019,
    degree: 'Business Administration',
    currentCompany: 'Microsoft',
    currentPosition: 'Product Manager',
    location: 'Seattle, WA',
    bio: 'Product manager with expertise in B2B SaaS products. Alumni association volunteer.',
    linkedinUrl: 'https://linkedin.com/in/janesmith',
    phone: '+1-555-0102',
    isPublic: true,
    skills: ['Product Management', 'Strategy', 'Analytics', 'Leadership'],
    interests: ['Product Strategy', 'User Experience', 'Team Building']
  },
  {
    userId: users[3]._id, // Mike Johnson
    firstName: 'Mike',
    lastName: 'Johnson',
    graduationYear: 2020,
    degree: 'Marketing',
    currentCompany: 'Startup Inc',
    currentPosition: 'Marketing Director',
    location: 'Austin, TX',
    bio: 'Digital marketing expert helping startups grow. Recent graduate looking to give back.',
    linkedinUrl: 'https://linkedin.com/in/mikejohnson',
    phone: '+1-555-0103',
    isPublic: true,
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    interests: ['Entrepreneurship', 'Content Creation', 'Networking']
  },
  {
    userId: users[4]._id, // Sarah Wilson
    firstName: 'Sarah',
    lastName: 'Wilson',
    graduationYear: 2017,
    degree: 'Data Science',
    currentCompany: 'Netflix',
    currentPosition: 'Senior Data Scientist',
    location: 'Los Angeles, CA',
    bio: 'Data scientist specializing in recommendation systems and machine learning.',
    linkedinUrl: 'https://linkedin.com/in/sarahwilson',
    phone: '+1-555-0104',
    isPublic: true,
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
    interests: ['AI Research', 'Data Visualization', 'Teaching']
  },
  {
    userId: users[5]._id, // David Brown
    firstName: 'David',
    lastName: 'Brown',
    graduationYear: 2016,
    degree: 'Finance',
    currentCompany: 'Goldman Sachs',
    currentPosition: 'Investment Banker',
    location: 'New York, NY',
    bio: 'Investment banker with focus on tech IPOs. Active in alumni fundraising.',
    linkedinUrl: 'https://linkedin.com/in/davidbrown',
    phone: '+1-555-0105',
    isPublic: true,
    skills: ['Financial Analysis', 'Investment Banking', 'Valuation', 'Excel'],
    interests: ['Finance', 'Investing', 'Alumni Relations']
  }
];

const generateEvents = (users: any[]) => [
  {
    title: 'Annual Alumni Reunion 2024',
    description: 'Join us for our biggest alumni gathering of the year! Reconnect with classmates, enjoy great food, and celebrate our shared memories.',
    eventDate: new Date('2024-06-15T18:00:00Z'),
    location: 'University Campus - Main Hall',
    capacity: 500,
    registrationDeadline: new Date('2024-06-01T23:59:59Z'),
    status: 'published',
    createdBy: users[0]._id // Admin
  },
  {
    title: 'Tech Career Panel Discussion',
    description: 'Learn from successful alumni in the tech industry. Panel discussion followed by networking session.',
    eventDate: new Date('2024-04-20T14:00:00Z'),
    location: 'Virtual Event - Zoom',
    capacity: 200,
    registrationDeadline: new Date('2024-04-18T23:59:59Z'),
    status: 'published',
    createdBy: users[0]._id // Admin
  },
  {
    title: 'Startup Pitch Competition',
    description: 'Alumni entrepreneurs pitch their startups to a panel of investors and fellow alumni.',
    eventDate: new Date('2024-05-10T19:00:00Z'),
    location: 'Innovation Center - Auditorium',
    capacity: 150,
    registrationDeadline: new Date('2024-05-05T23:59:59Z'),
    status: 'published',
    createdBy: users[0]._id // Admin
  }
];

const generateCampaigns = (users: any[]) => [
  {
    title: 'New Library Construction Fund',
    description: 'Help us build a state-of-the-art library for current and future students. Your contribution will create a lasting impact on education.',
    goalAmount: 500000,
    currentAmount: 125000,
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-12-31T23:59:59Z'),
    status: 'active',
    createdBy: users[0]._id // Admin
  },
  {
    title: 'Student Scholarship Program',
    description: 'Support deserving students with financial assistance to pursue their education dreams.',
    goalAmount: 100000,
    currentAmount: 45000,
    startDate: new Date('2024-02-01T00:00:00Z'),
    endDate: new Date('2024-08-31T23:59:59Z'),
    status: 'active',
    createdBy: users[0]._id // Admin
  }
];

const generateDonations = (alumni: any[], campaigns: any[]) => [
  {
    donorId: alumni[0]._id, // John Doe
    amount: 5000,
    purpose: 'Library Construction',
    campaignId: campaigns[0]._id,
    paymentMethod: 'credit_card',
    transactionId: 'txn_001',
    status: 'completed',
    donationDate: new Date('2024-02-15T10:30:00Z')
  },
  {
    donorId: alumni[1]._id, // Jane Smith
    amount: 2500,
    purpose: 'Student Scholarships',
    campaignId: campaigns[1]._id,
    paymentMethod: 'bank_transfer',
    transactionId: 'txn_002',
    status: 'completed',
    donationDate: new Date('2024-02-20T14:15:00Z')
  },
  {
    donorId: alumni[4]._id, // David Brown
    amount: 10000,
    purpose: 'Library Construction',
    campaignId: campaigns[0]._id,
    paymentMethod: 'credit_card',
    transactionId: 'txn_003',
    status: 'completed',
    donationDate: new Date('2024-03-01T09:45:00Z')
  }
];

const generateCommunications = (users: any[]) => [
  {
    title: 'Welcome to the New Alumni Portal!',
    content: 'We are excited to announce the launch of our new alumni management portal. This platform will help you stay connected with fellow alumni, discover events, and contribute to our community.',
    type: 'announcement',
    targetAudience: ['all'],
    status: 'sent',
    sentDate: new Date('2024-01-15T10:00:00Z'),
    recipients: [],
    deliveryStats: {
      sent: 1250,
      delivered: 1200,
      opened: 850,
      clicked: 320,
      failed: 50
    },
    createdBy: users[0]._id // Admin
  },
  {
    title: 'Monthly Alumni Newsletter - March 2024',
    content: 'Check out the latest news from our alumni community, upcoming events, and success stories from your fellow graduates.',
    type: 'newsletter',
    targetAudience: ['all'],
    status: 'sent',
    sentDate: new Date('2024-03-01T08:00:00Z'),
    recipients: [],
    deliveryStats: {
      sent: 1300,
      delivered: 1250,
      opened: 900,
      clicked: 450,
      failed: 50
    },
    createdBy: users[0]._id // Admin
  }
];

const generateCommunicationTemplates = (users: any[]) => [
  {
    name: 'Event Invitation Template',
    subject: 'You\'re Invited: {{eventTitle}}',
    content: 'Dear {{firstName}},\n\nWe are excited to invite you to {{eventTitle}} on {{eventDate}}.\n\n{{eventDescription}}\n\nLocation: {{eventLocation}}\nDate: {{eventDate}}\n\nPlease RSVP by {{registrationDeadline}}.\n\nBest regards,\nAlumni Relations Team',
    type: 'event_invitation',
    variables: ['firstName', 'eventTitle', 'eventDate', 'eventDescription', 'eventLocation', 'registrationDeadline'],
    createdBy: users[0]._id // Admin
  },
  {
    name: 'Donation Thank You Template',
    subject: 'Thank You for Your Generous Donation',
    content: 'Dear {{firstName}},\n\nThank you for your generous donation of ${{amount}} to {{campaignTitle}}.\n\nYour contribution makes a real difference in the lives of our students and the future of our institution.\n\nWith gratitude,\nAlumni Relations Team',
    type: 'donation_request',
    variables: ['firstName', 'amount', 'campaignTitle'],
    createdBy: users[0]._id // Admin
  }
];

/**
 * Seed the database with sample data
 */
async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    logger.info('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      AlumniProfile.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      Communication.deleteMany({}),
      CommunicationTemplate.deleteMany({}),
      Donation.deleteMany({}),
      Campaign.deleteMany({}),
      MentorProfile.deleteMany({}),
      MenteeProfile.deleteMany({}),
      MentorshipConnection.deleteMany({})
    ]);

    // Create users
    logger.info('Creating users...');
    const users = await User.insertMany(generateUsers());
    logger.info(`Created ${users.length} users`);

    // Create alumni profiles
    logger.info('Creating alumni profiles...');
    const alumni = await AlumniProfile.insertMany(generateAlumniProfiles(users));
    logger.info(`Created ${alumni.length} alumni profiles`);

    // Create events
    logger.info('Creating events...');
    const events = await Event.insertMany(generateEvents(users));
    logger.info(`Created ${events.length} events`);

    // Create campaigns
    logger.info('Creating campaigns...');
    const campaigns = await Campaign.insertMany(generateCampaigns(users));
    logger.info(`Created ${campaigns.length} campaigns`);

    // Create donations
    logger.info('Creating donations...');
    const donations = await Donation.insertMany(generateDonations(alumni, campaigns));
    logger.info(`Created ${donations.length} donations`);

    // Create communications
    logger.info('Creating communications...');
    const communications = await Communication.insertMany(generateCommunications(users));
    logger.info(`Created ${communications.length} communications`);

    // Create communication templates
    logger.info('Creating communication templates...');
    const templates = await CommunicationTemplate.insertMany(generateCommunicationTemplates(users));
    logger.info(`Created ${templates.length} communication templates`);

    // Create some event registrations
    logger.info('Creating event registrations...');
    const registrations = [];
    for (let i = 0; i < alumni.length; i++) {
      for (let j = 0; j < Math.min(2, events.length); j++) {
        registrations.push({
          eventId: events[j]._id,
          alumniId: alumni[i]._id,
          status: Math.random() > 0.3 ? 'registered' : 'attended',
          registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    }
    await EventRegistration.insertMany(registrations);
    logger.info(`Created ${registrations.length} event registrations`);

    // Create mentor profiles
    logger.info('Creating mentor profiles...');
    const mentorProfiles = [
      {
        alumniId: alumni[0]._id, // John Doe
        expertise: ['Software Engineering', 'Full Stack Development', 'Career Guidance'],
        industries: ['Technology', 'Software'],
        yearsOfExperience: 5,
        maxMentees: 3,
        currentMentees: 1,
        bio: 'Experienced software engineer passionate about helping new graduates navigate their tech careers.',
        availableHours: ['evening', 'weekend'],
        preferredCommunication: ['video_call', 'email']
      },
      {
        alumniId: alumni[1]._id, // Jane Smith
        expertise: ['Product Management', 'Strategy', 'Leadership'],
        industries: ['Technology', 'SaaS'],
        yearsOfExperience: 4,
        maxMentees: 2,
        currentMentees: 0,
        bio: 'Product manager helping others transition into product roles and develop leadership skills.',
        availableHours: ['afternoon', 'evening'],
        preferredCommunication: ['video_call', 'phone']
      }
    ];
    const mentors = await MentorProfile.insertMany(mentorProfiles);
    logger.info(`Created ${mentors.length} mentor profiles`);

    // Create mentee profiles
    logger.info('Creating mentee profiles...');
    const menteeProfiles = [
      {
        alumniId: alumni[2]._id, // Mike Johnson
        goals: ['Career Transition', 'Skill Development', 'Networking'],
        interestedIndustries: ['Technology', 'Marketing'],
        careerStage: 'early_career',
        bio: 'Recent graduate looking to transition from marketing to product management.',
        preferredCommunication: ['video_call', 'messaging']
      }
    ];
    const mentees = await MenteeProfile.insertMany(menteeProfiles);
    logger.info(`Created ${mentees.length} mentee profiles`);

    // Create mentorship connections
    logger.info('Creating mentorship connections...');
    const connections = [
      {
        mentorId: mentors[0]._id,
        menteeId: mentees[0]._id,
        status: 'active',
        startDate: new Date('2024-02-01T00:00:00Z'),
        notes: 'Looking for guidance on transitioning to product management role.',
        mentorFeedback: 'Great mentee, very motivated and asks thoughtful questions.',
        menteeFeedback: 'Excellent mentor, very helpful and responsive.',
        rating: 5
      }
    ];
    await MentorshipConnection.insertMany(connections);
    logger.info(`Created ${connections.length} mentorship connections`);

    logger.info('Database seeding completed successfully!');
    
    // Print summary
    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🎓 Alumni Profiles: ${alumni.length}`);
    console.log(`📅 Events: ${events.length}`);
    console.log(`📝 Event Registrations: ${registrations.length}`);
    console.log(`💰 Campaigns: ${campaigns.length}`);
    console.log(`💸 Donations: ${donations.length}`);
    console.log(`📧 Communications: ${communications.length}`);
    console.log(`📋 Communication Templates: ${templates.length}`);
    console.log(`👨‍🏫 Mentors: ${mentors.length}`);
    console.log(`👨‍🎓 Mentees: ${mentees.length}`);
    console.log(`🤝 Mentorship Connections: ${connections.length}`);

  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Database seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };