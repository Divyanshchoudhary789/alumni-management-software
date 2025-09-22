import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../config/logger';
import { seedUsers } from './seeders/userSeeder';
import { seedAlumniProfiles } from './seeders/alumniSeeder';
import { seedEvents } from './seeders/eventSeeder';
import { seedCampaigns } from './seeders/campaignSeeder';
import { seedCommunicationTemplates } from './seeders/communicationSeeder';

// Load environment variables
dotenv.config();

async function runSeeders() {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Run seeders in order
    await seedUsers();
    await seedAlumniProfiles();
    await seedEvents();
    await seedCampaigns();
    await seedCommunicationTemplates();
    
    logger.info('Database seeding completed successfully');
    
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}

export { runSeeders };