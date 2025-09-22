import { User } from '../../models/User';
import { logger } from '../../config/logger';

const sampleUsers = [
  {
    clerkUserId: 'clerk_admin_001',
    email: 'admin@university.edu',
    role: 'admin' as const,
    oauthProvider: 'google' as const,
  },
  {
    clerkUserId: 'clerk_alumni_001',
    email: 'john.doe@email.com',
    role: 'alumni' as const,
    oauthProvider: 'linkedin' as const,
  },
  {
    clerkUserId: 'clerk_alumni_002',
    email: 'jane.smith@email.com',
    role: 'alumni' as const,
    oauthProvider: 'google' as const,
  },
  {
    clerkUserId: 'clerk_alumni_003',
    email: 'mike.johnson@email.com',
    role: 'alumni' as const,
    oauthProvider: 'linkedin' as const,
  },
  {
    clerkUserId: 'clerk_alumni_004',
    email: 'sarah.wilson@email.com',
    role: 'alumni' as const,
    oauthProvider: 'google' as const,
  },
];

export async function seedUsers(): Promise<void> {
  try {
    logger.info('Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    
    logger.info(`Successfully seeded ${users.length} users`);
    
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
}