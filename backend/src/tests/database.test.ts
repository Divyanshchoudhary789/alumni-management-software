import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';

describe('Database Connection', () => {
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/alumni-management-test';
    
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await User.deleteMany({});
  });

  test('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  test('should create a user', async () => {
    const userData = {
      clerkUserId: 'test_clerk_id',
      email: 'test@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.clerkUserId).toBe(userData.clerkUserId);
  });

  test('should enforce unique constraints', async () => {
    const userData = {
      clerkUserId: 'test_clerk_id',
      email: 'test@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    };

    // Create first user
    const user1 = new User(userData);
    await user1.save();

    // Try to create second user with same email
    const user2 = new User(userData);
    
    await expect(user2.save()).rejects.toThrow();
  });
});