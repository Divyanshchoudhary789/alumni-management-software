import { Event } from '../../models/Event';
import { User } from '../../models/User';
import { logger } from '../../config/logger';

export async function seedEvents(): Promise<void> {
  try {
    logger.info('Seeding events...');
    
    // Get admin user to create events
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      logger.warn('No admin user found. Skipping event seeding.');
      return;
    }
    
    // Clear existing events
    await Event.deleteMany({});
    
    const currentDate = new Date();
    const futureDate1 = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const futureDate2 = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
    const futureDate3 = new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
    
    const sampleEvents = [
      {
        title: 'Annual Alumni Networking Gala',
        description: 'Join us for our annual networking gala featuring keynote speakers, networking opportunities, and celebration of alumni achievements.',
        eventDate: futureDate1,
        location: 'Grand Ballroom, University Center',
        capacity: 200,
        registrationDeadline: new Date(futureDate1.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before event
        status: 'published' as const,
        createdBy: adminUser._id,
      },
      {
        title: 'Tech Industry Career Panel',
        description: 'Panel discussion with alumni working in top tech companies. Learn about career paths, industry trends, and networking opportunities.',
        eventDate: futureDate2,
        location: 'Auditorium A, Engineering Building',
        capacity: 100,
        registrationDeadline: new Date(futureDate2.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before event
        status: 'published' as const,
        createdBy: adminUser._id,
      },
      {
        title: 'Alumni Mentorship Program Launch',
        description: 'Launch event for our new mentorship program connecting experienced alumni with recent graduates and current students.',
        eventDate: futureDate3,
        location: 'Student Union Conference Room',
        capacity: 50,
        registrationDeadline: new Date(futureDate3.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before event
        status: 'draft' as const,
        createdBy: adminUser._id,
      },
    ];
    
    const events = await Event.insertMany(sampleEvents);
    
    logger.info(`Successfully seeded ${events.length} events`);
    
  } catch (error) {
    logger.error('Error seeding events:', error);
    throw error;
  }
}