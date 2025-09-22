import { CommunicationTemplate } from '../../models/Communication';
import { User } from '../../models/User';
import { logger } from '../../config/logger';

export async function seedCommunicationTemplates(): Promise<void> {
  try {
    logger.info('Seeding communication templates...');
    
    // Get admin user to create templates
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      logger.warn('No admin user found. Skipping communication template seeding.');
      return;
    }
    
    // Clear existing templates
    await CommunicationTemplate.deleteMany({});
    
    const sampleTemplates = [
      {
        name: 'Welcome New Alumni',
        subject: 'Welcome to the Alumni Network, {{firstName}}!',
        content: '<h2>Welcome to our Alumni Network!</h2>' +
          '<p>Dear {{firstName}} {{lastName}},</p>' +
          '<p>Congratulations on your graduation! We\'re excited to welcome you to our growing alumni community.</p>' +
          '<p>As an alumnus, you now have access to:</p>' +
          '<ul>' +
          '<li>Exclusive networking events</li>' +
          '<li>Career development resources</li>' +
          '<li>Mentorship opportunities</li>' +
          '<li>Alumni directory</li>' +
          '</ul>' +
          '<p>We look forward to staying connected with you throughout your career journey.</p>' +
          '<p>Best regards,<br>Alumni Relations Team</p>',
        type: 'general' as const,
        variables: ['firstName', 'lastName'],
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        name: 'Event Invitation',
        subject: 'You\'re Invited: {{eventTitle}}',
        content: '<h2>{{eventTitle}}</h2>' +
          '<p>Dear {{firstName}},</p>' +
          '<p>You\'re cordially invited to attend {{eventTitle}}.</p>' +
          '<p><strong>Date:</strong> {{eventDate}}</p>' +
          '<p><strong>Time:</strong> {{eventTime}}</p>' +
          '<p><strong>Location:</strong> {{eventLocation}}</p>' +
          '<p>{{eventDescription}}</p>' +
          '<p>Please RSVP by {{rsvpDeadline}} to secure your spot.</p>' +
          '<p><a href="{{registrationLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Register Now</a></p>' +
          '<p>We look forward to seeing you there!</p>' +
          '<p>Best regards,<br>Alumni Relations Team</p>',
        type: 'event_invitation' as const,
        variables: ['firstName', 'eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'eventDescription', 'rsvpDeadline', 'registrationLink'],
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        name: 'Monthly Newsletter',
        subject: 'Alumni Newsletter - {{monthYear}}',
        content: '<h1>Alumni Newsletter - {{monthYear}}</h1>' +
          '<h2>In This Issue</h2>' +
          '<ul>' +
          '<li>Alumni Spotlight</li>' +
          '<li>Upcoming Events</li>' +
          '<li>Career Opportunities</li>' +
          '<li>University News</li>' +
          '</ul>' +
          '<h2>Alumni Spotlight</h2>' +
          '<p>{{spotlightContent}}</p>' +
          '<h2>Upcoming Events</h2>' +
          '<p>{{upcomingEvents}}</p>' +
          '<h2>Career Opportunities</h2>' +
          '<p>{{careerOpportunities}}</p>' +
          '<h2>University News</h2>' +
          '<p>{{universityNews}}</p>' +
          '<p>Thank you for being part of our alumni community!</p>' +
          '<p>Best regards,<br>Alumni Relations Team</p>',
        type: 'newsletter' as const,
        variables: ['monthYear', 'spotlightContent', 'upcomingEvents', 'careerOpportunities', 'universityNews'],
        createdBy: adminUser._id,
        isActive: true,
      },
      {
        name: 'Donation Thank You',
        subject: 'Thank You for Your Generous Donation',
        content: '<h2>Thank You for Your Support!</h2>' +
          '<p>Dear {{firstName}} {{lastName}},</p>' +
          '<p>Thank you for your generous donation of ${{donationAmount}} to {{campaignName}}.</p>' +
          '<p>Your contribution makes a real difference in the lives of our students and the future of our institution.</p>' +
          '<p><strong>Donation Details:</strong></p>' +
          '<ul>' +
          '<li>Amount: ${{donationAmount}}</li>' +
          '<li>Date: {{donationDate}}</li>' +
          '<li>Campaign: {{campaignName}}</li>' +
          '<li>Transaction ID: {{transactionId}}</li>' +
          '</ul>' +
          '<p>A tax receipt has been sent to your email address for your records.</p>' +
          '<p>With heartfelt gratitude,<br>Alumni Relations Team</p>',
        type: 'donation_request' as const,
        variables: ['firstName', 'lastName', 'donationAmount', 'campaignName', 'donationDate', 'transactionId'],
        createdBy: adminUser._id,
        isActive: true,
      },
    ];
    
    const templates = await CommunicationTemplate.insertMany(sampleTemplates);
    
    logger.info(`Successfully seeded ${templates.length} communication templates`);
    
  } catch (error) {
    logger.error('Error seeding communication templates:', error);
    throw error;
  }
}