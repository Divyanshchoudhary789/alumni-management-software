import request from 'supertest';
import app from '../../server';
import { connectDatabase } from '../../config/database';
import { AlumniProfile } from '../../models/AlumniProfile';
import { User } from '../../models';

// Mock Clerk authentication
jest.mock('@clerk/backend', () => ({
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
  verifyToken: jest.fn(),
}));

const { verifyToken } = require('@clerk/backend');

describe('Alumni API Routes', () => {
  let authToken: string;
  let testUser: any;
  let testAlumni: any;

  beforeAll(async () => {
    await connectDatabase();
    
    // Create test user
    testUser = new User({
      clerkUserId: 'test-clerk-id',
      email: 'test@example.com',
      role: 'admin',
      oauthProvider: 'google'
    });
    await testUser.save();

    // Mock auth token
    authToken = 'mock-auth-token';
    verifyToken.mockResolvedValue({
      sub: 'test-clerk-id',
      sid: 'test-session-id'
    });
  });

  beforeEach(async () => {
    // Clean up alumni profiles
    await AlumniProfile.deleteMany({});
    
    // Create test alumni profile
    testAlumni = new AlumniProfile({
      userId: testUser._id,
      firstName: 'John',
      lastName: 'Doe',
      graduationYear: 2020,
      degree: 'Computer Science',
      currentCompany: 'Tech Corp',
      currentPosition: 'Software Engineer',
      location: 'San Francisco',
      bio: 'Software engineer with 5 years experience',
      isPublic: true,
      skills: ['JavaScript', 'React', 'Node.js'],
      interests: ['Technology', 'Startups']
    });
    await testAlumni.save();
  });

  afterAll(async () => {
    await AlumniProfile.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/alumni', () => {
    it('should return list of alumni', async () => {
      const response = await request(app)
        .get('/api/alumni')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.alumni).toHaveLength(1);
      expect(response.body.alumni[0].firstName).toBe('John');
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter alumni by graduation year', async () => {
      const response = await request(app)
        .get('/api/alumni?graduationYear=2020')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.alumni).toHaveLength(1);
      expect(response.body.alumni[0].graduationYear).toBe(2020);
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/alumni')
        .expect(401);
    });
  });

  describe('GET /api/alumni/:id', () => {
    it('should return specific alumni profile', async () => {
      const response = await request(app)
        .get(`/api/alumni/${testAlumni._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
    });

    it('should return 404 for non-existent alumni', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/api/alumni/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/alumni/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/alumni', () => {
    it('should create new alumni profile', async () => {
      const newAlumniData = {
        userId: testUser._id,
        firstName: 'Jane',
        lastName: 'Smith',
        graduationYear: 2021,
        degree: 'Business Administration',
        currentCompany: 'Business Corp',
        isPublic: true
      };

      const response = await request(app)
        .post('/api/alumni')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newAlumniData)
        .expect(201);

      expect(response.body.firstName).toBe('Jane');
      expect(response.body.lastName).toBe('Smith');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        firstName: 'Jane'
      };

      await request(app)
        .post('/api/alumni')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('GET /api/alumni/stats/overview', () => {
    it('should return alumni statistics', async () => {
      const response = await request(app)
        .get('/api/alumni/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalAlumni).toBe(1);
      expect(response.body.publicProfiles).toBe(1);
      expect(response.body.graduationYearStats).toBeDefined();
    });
  });
});