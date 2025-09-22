import request from 'supertest';
import app from '../../server';
import { connectDatabase } from '../../config/database';
import { Event, EventRegistration } from '../../models/Event';
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

describe('Events API Routes', () => {
  let authToken: string;
  let testUser: any;
  let testEvent: any;

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
    // Clean up events
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    
    // Create test event
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 30); // 30 days from now
    
    const registrationDeadline = new Date();
    registrationDeadline.setDate(registrationDeadline.getDate() + 20); // 20 days from now

    testEvent = new Event({
      title: 'Alumni Networking Event',
      description: 'Annual networking event for all alumni',
      eventDate,
      location: 'San Francisco, CA',
      capacity: 100,
      registrationDeadline,
      status: 'published',
      createdBy: testUser._id
    });
    await testEvent.save();
  });

  afterAll(async () => {
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/events', () => {
    it('should return list of events', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0].title).toBe('Alumni Networking Event');
      expect(response.body.events[0].registrationCount).toBe(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter upcoming events', async () => {
      const response = await request(app)
        .get('/api/events?upcoming=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.events).toHaveLength(1);
      expect(new Date(response.body.events[0].eventDate)).toBeInstanceOf(Date);
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/events')
        .expect(401);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return specific event', async () => {
      const response = await request(app)
        .get(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.title).toBe('Alumni Networking Event');
      expect(response.body.registrationCount).toBe(0);
      expect(response.body.spotsRemaining).toBe(100);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/events', () => {
    it('should create new event', async () => {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 60);
      
      const registrationDeadline = new Date();
      registrationDeadline.setDate(registrationDeadline.getDate() + 50);

      const newEventData = {
        title: 'Tech Talk Series',
        description: 'Monthly tech talk for alumni',
        eventDate: eventDate.toISOString(),
        location: 'Virtual',
        capacity: 50,
        registrationDeadline: registrationDeadline.toISOString(),
        status: 'published'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEventData)
        .expect(201);

      expect(response.body.title).toBe('Tech Talk Series');
      expect(response.body.capacity).toBe(50);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        title: 'Incomplete Event'
      };

      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('GET /api/events/stats/overview', () => {
    it('should return events statistics', async () => {
      const response = await request(app)
        .get('/api/events/stats/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalEvents).toBe(1);
      expect(response.body.publishedEvents).toBe(1);
      expect(response.body.upcomingEvents).toBe(1);
    });
  });
});