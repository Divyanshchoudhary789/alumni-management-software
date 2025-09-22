import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models';

describe('Basic Functionality Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('User model should work correctly', async () => {
    const userData = {
      clerkUserId: 'clerk_test_123',
      email: 'test@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    };

    const user = new User(userData);
    await user.save();

    expect(user.clerkUserId).toBe('clerk_test_123');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('alumni');
    expect(user.oauthProvider).toBe('google');

    // Test unique constraints
    const duplicateUser = new User(userData);
    await expect(duplicateUser.save()).rejects.toThrow();
  });

  test('User model validation should work', async () => {
    // Test missing required fields
    const invalidUser = new User({
      email: 'test@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    });

    await expect(invalidUser.save()).rejects.toThrow();
  });

  test('User model should default role to alumni', async () => {
    const userData = {
      clerkUserId: 'clerk_test_123',
      email: 'test@example.com',
      oauthProvider: 'google' as const,
    };

    const user = new User(userData);
    await user.save();

    expect(user.role).toBe('alumni');
  });
});