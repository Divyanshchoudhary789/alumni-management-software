import { Campaign } from '../../models/Donation';
import { User } from '../../models/User';
import { logger } from '../../config/logger';

export async function seedCampaigns(): Promise<void> {
  try {
    logger.info('Seeding donation campaigns...');
    
    // Get admin user to create campaigns
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      logger.warn('No admin user found. Skipping campaign seeding.');
      return;
    }
    
    // Clear existing campaigns
    await Campaign.deleteMany({});
    
    const currentDate = new Date();
    const startDate1 = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate1 = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
    
    const startDate2 = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const endDate2 = new Date(currentDate.getTime() + 120 * 24 * 60 * 60 * 1000); // 120 days from now
    
    const sampleCampaigns = [
      {
        title: 'Scholarship Fund 2024',
        description: 'Help us provide scholarships to deserving students who need financial assistance to pursue their education.',
        goalAmount: 50000,
        currentAmount: 15000,
        startDate: startDate1,
        endDate: endDate1,
        status: 'active' as const,
        createdBy: adminUser._id,
      },
      {
        title: 'New Library Construction',
        description: 'Support the construction of our new state-of-the-art library facility that will serve students for generations to come.',
        goalAmount: 500000,
        currentAmount: 75000,
        startDate: startDate1,
        endDate: endDate1,
        status: 'active' as const,
        createdBy: adminUser._id,
      },
      {
        title: 'Alumni Emergency Fund',
        description: 'Create an emergency fund to support alumni facing unexpected financial hardships.',
        goalAmount: 25000,
        currentAmount: 0,
        startDate: startDate2,
        endDate: endDate2,
        status: 'draft' as const,
        createdBy: adminUser._id,
      },
    ];
    
    const campaigns = await Campaign.insertMany(sampleCampaigns);
    
    logger.info(`Successfully seeded ${campaigns.length} campaigns`);
    
  } catch (error) {
    logger.error('Error seeding campaigns:', error);
    throw error;
  }
}