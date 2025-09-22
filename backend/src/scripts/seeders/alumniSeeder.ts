import { AlumniProfile } from '../../models/AlumniProfile';
import { User } from '../../models/User';
import { logger } from '../../config/logger';

export async function seedAlumniProfiles(): Promise<void> {
  try {
    logger.info('Seeding alumni profiles...');
    
    // Get alumni users (excluding admin)
    const alumniUsers = await User.find({ role: 'alumni' });
    
    if (alumniUsers.length === 0) {
      logger.warn('No alumni users found. Skipping alumni profile seeding.');
      return;
    }
    
    // Clear existing alumni profiles
    await AlumniProfile.deleteMany({});
    
    const sampleProfiles = [
      {
        userId: alumniUsers[0]._id,
        firstName: 'John',
        lastName: 'Doe',
        graduationYear: 2018,
        degree: 'Computer Science',
        currentCompany: 'Tech Corp',
        currentPosition: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        bio: 'Passionate software engineer with 5+ years of experience in full-stack development.',
        linkedinUrl: 'https://www.linkedin.com/in/johndoe',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        interests: ['Technology', 'Mentoring', 'Startups'],
        isPublic: true,
      },
      {
        userId: alumniUsers[1]._id,
        firstName: 'Jane',
        lastName: 'Smith',
        graduationYear: 2019,
        degree: 'Business Administration',
        currentCompany: 'Global Consulting',
        currentPosition: 'Management Consultant',
        location: 'New York, NY',
        bio: 'Strategic business consultant helping companies optimize their operations.',
        linkedinUrl: 'https://www.linkedin.com/in/janesmith',
        skills: ['Strategy', 'Operations', 'Analytics', 'Leadership'],
        interests: ['Business Strategy', 'Networking', 'Travel'],
        isPublic: true,
      },
      {
        userId: alumniUsers[2]._id,
        firstName: 'Mike',
        lastName: 'Johnson',
        graduationYear: 2020,
        degree: 'Marketing',
        currentCompany: 'Creative Agency',
        currentPosition: 'Digital Marketing Manager',
        location: 'Los Angeles, CA',
        bio: 'Creative marketing professional specializing in digital campaigns and brand strategy.',
        linkedinUrl: 'https://www.linkedin.com/in/mikejohnson',
        skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
        interests: ['Marketing', 'Design', 'Photography'],
        isPublic: true,
      },
      {
        userId: alumniUsers[3]._id,
        firstName: 'Sarah',
        lastName: 'Wilson',
        graduationYear: 2017,
        degree: 'Engineering',
        currentCompany: 'Innovation Labs',
        currentPosition: 'Product Manager',
        location: 'Seattle, WA',
        bio: 'Product manager with engineering background, focused on building user-centric solutions.',
        linkedinUrl: 'https://www.linkedin.com/in/sarahwilson',
        skills: ['Product Management', 'Engineering', 'UX Design', 'Agile'],
        interests: ['Product Development', 'Innovation', 'Mentoring'],
        isPublic: true,
      },
    ];
    
    // Only create profiles for available users
    const profilesToCreate = sampleProfiles.slice(0, alumniUsers.length);
    const profiles = await AlumniProfile.insertMany(profilesToCreate);
    
    logger.info(`Successfully seeded ${profiles.length} alumni profiles`);
    
  } catch (error) {
    logger.error('Error seeding alumni profiles:', error);
    throw error;
  }
}