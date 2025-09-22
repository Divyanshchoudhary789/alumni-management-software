import { AlumniProfile } from '@/types';

export const mockAlumniProfiles: AlumniProfile[] = [
  {
    id: '1',
    userId: 'user_1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    graduationYear: 2018,
    degree: 'Computer Science',
    currentCompany: 'Google',
    currentPosition: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    bio: 'Passionate about building scalable web applications and mentoring junior developers.',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    linkedinUrl: 'https://linkedin.com/in/sarah-johnson',
    websiteUrl: 'https://sarahjohnson.dev',
    phone: '+1-555-0123',
    isPublic: true,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    interests: ['Web Development', 'Machine Learning', 'Mentoring'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    userId: 'user_2',
    firstName: 'Michael',
    lastName: 'Chen',
    graduationYear: 2020,
    degree: 'Business Administration',
    currentCompany: 'McKinsey & Company',
    currentPosition: 'Management Consultant',
    location: 'New York, NY',
    bio: 'Strategy consultant helping Fortune 500 companies with digital transformation.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    linkedinUrl: 'https://linkedin.com/in/michael-chen',
    phone: '+1-555-0124',
    isPublic: true,
    skills: ['Strategy', 'Analytics', 'Project Management', 'Leadership'],
    interests: ['Business Strategy', 'Technology', 'Travel'],
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '3',
    userId: 'user_3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    graduationYear: 2019,
    degree: 'Marketing',
    currentCompany: 'HubSpot',
    currentPosition: 'Product Marketing Manager',
    location: 'Boston, MA',
    bio: 'Product marketer focused on SaaS growth and customer acquisition strategies.',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    linkedinUrl: 'https://linkedin.com/in/emily-rodriguez',
    websiteUrl: 'https://emilyrodriguez.com',
    phone: '+1-555-0125',
    isPublic: true,
    skills: ['Product Marketing', 'Growth Hacking', 'Analytics', 'Content Strategy'],
    interests: ['Digital Marketing', 'Startups', 'Photography'],
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '4',
    userId: 'user_4',
    firstName: 'David',
    lastName: 'Thompson',
    graduationYear: 2017,
    degree: 'Mechanical Engineering',
    currentCompany: 'Tesla',
    currentPosition: 'Senior Design Engineer',
    location: 'Austin, TX',
    bio: 'Mechanical engineer working on next-generation electric vehicle designs.',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    linkedinUrl: 'https://linkedin.com/in/david-thompson',
    phone: '+1-555-0126',
    isPublic: true,
    skills: ['CAD Design', 'Manufacturing', 'Project Management', 'Innovation'],
    interests: ['Automotive', 'Sustainability', 'Cycling'],
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '5',
    userId: 'user_5',
    firstName: 'Jessica',
    lastName: 'Park',
    graduationYear: 2021,
    degree: 'Data Science',
    currentCompany: 'Netflix',
    currentPosition: 'Data Scientist',
    location: 'Los Angeles, CA',
    bio: 'Data scientist specializing in recommendation systems and user behavior analysis.',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    linkedinUrl: 'https://linkedin.com/in/jessica-park',
    phone: '+1-555-0127',
    isPublic: true,
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
    interests: ['AI/ML', 'Data Visualization', 'Gaming'],
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2024-01-15')
  }
];

// Generate additional alumni with varied data
export const generateMockAlumni = (count: number = 50): AlumniProfile[] => {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const degrees = ['Computer Science', 'Business Administration', 'Engineering', 'Marketing', 'Data Science', 'Psychology', 'Economics', 'Biology', 'Chemistry', 'Physics'];
  const companies = ['Apple', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Uber', 'Airbnb', 'Stripe', 'Shopify'];
  const positions = ['Software Engineer', 'Product Manager', 'Data Analyst', 'Marketing Manager', 'Consultant', 'Designer', 'Sales Manager', 'Operations Manager'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO'];
  const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Analytics', 'Leadership', 'Strategy', 'Design'];

  const additionalAlumni: AlumniProfile[] = [];

  for (let i = 6; i <= count + 5; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const graduationYear = 2015 + Math.floor(Math.random() * 9); // 2015-2023
    const degree = degrees[Math.floor(Math.random() * degrees.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const selectedSkills = skills
      .sort(() => 0.5 - Math.random())
      .slice(0, 3 + Math.floor(Math.random() * 3));

    additionalAlumni.push({
      id: i.toString(),
      userId: `user_${i}`,
      firstName,
      lastName,
      graduationYear,
      degree,
      currentCompany: company,
      currentPosition: position,
      location,
      bio: `${position} at ${company} with expertise in ${selectedSkills.slice(0, 2).join(' and ')}.`,
      profileImage: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400`,
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      phone: `+1-555-${String(i).padStart(4, '0')}`,
      isPublic: Math.random() > 0.2, // 80% public profiles
      skills: selectedSkills,
      interests: selectedSkills.slice(0, 2).concat(['Networking']),
      createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date(2024, 0, Math.floor(Math.random() * 15) + 1)
    });
  }

  return [...mockAlumniProfiles, ...additionalAlumni];
};