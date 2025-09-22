import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models';

describe('User Sync Tests', () => {
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

  test('should create a user with valid data', async () => {
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
  });

  test('should enforce unique clerkUserId', async () => {
    const userData1 = {
      clerkUserId: 'clerk_test_123',
      email: 'test1@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    };

    const userData2 = {
      clerkUserId: 'clerk_test_123',
      email: 'test2@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    };

    const user1 = new User(userData1);
    await user1.save();

    const user2 = new User(userData2);
    await expect(user2.save()).rejects.toThrow();
  });

  test('should enforce unique email', async () => {
    const userData1 = {
      clerkUserId: 'clerk_test_123',
      email: 'test@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    };

    const userData2 = {
      clerkUserId: 'clerk_test_456',
      email: 'test@example.com',
      role: 'alumni' as const,
      oauthProvider: 'google' as const,
    };

    const user1 = new User(userData1);
    await user1.save();

    const user2 = new User(userData2);
    await expect(user2.save()).rejects.toThrow();
  });

  test('should validate role enum', async () => {
    const userData = {
      clerkUserId: 'clerk_test_123',
      email: 'test@example.com',
      role: 'invalid' as any,
      oauthProvider: 'google' as const,
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  test('should validate oauthProvider enum', async () => {
    const userData = {
      clerkUserId: 'clerk_test_123',
      email: 'test@example.com',
      role: 'alumni' as const,
      oauthProvider: 'invalid' as any,
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  test('should default role to alumni', async () => {
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