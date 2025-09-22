import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models';
import { syncUserFromClerk } from '../middleware/auth';

describe('Clerk Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  });

  describe('User Sync Functionality', () => {
    it('should create a new user when syncing from Clerk', async () => {
      const clerkUserData = {
        id: 'clerk_test_user_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com'
          }
        ],
        primaryEmailAddressId: 'email_123',
        externalAccounts: [
          {
            provider: 'oauth_google'
          }
        ]
      };

      const user = await syncUserFromClerk('clerk_test_user_123', clerkUserData);

      expect(user).toBeDefined();
      expect(user.clerkUserId).toBe('clerk_test_user_123');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('alumni');
      expect(user.oauthProvider).toBe('google');

      // Verify user was saved to database
      const savedUser = await User.findOne({ clerkUserId: 'clerk_test_user_123' });
      expect(savedUser).toBeTruthy();
    });

    it('should update existing user when syncing from Clerk', async () => {
      // Create existing user
      const existingUser = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'old@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await existingUser.save();

      const clerkUserData = {
        id: 'clerk_test_user_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'new@example.com'
          }
        ],
        primaryEmailAddressId: 'email_123',
        externalAccounts: [
          {
            provider: 'oauth_linkedin'
          }
        ]
      };

      const user = await syncUserFromClerk('clerk_test_user_123', clerkUserData);

      expect(user.email).toBe('new@example.com');
      expect(user.oauthProvider).toBe('linkedin');

      // Verify only one user exists
      const userCount = await User.countDocuments({ clerkUserId: 'clerk_test_user_123' });
      expect(userCount).toBe(1);
    });

    it('should handle LinkedIn OAuth provider correctly', async () => {
      const clerkUserData = {
        id: 'clerk_test_user_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com'
          }
        ],
        primaryEmailAddressId: 'email_123',
        externalAccounts: [
          {
            provider: 'oauth_linkedin'
          }
        ]
      };

      const user = await syncUserFromClerk('clerk_test_user_123', clerkUserData);

      expect(user.oauthProvider).toBe('linkedin');
    });

    it('should handle linkedin provider variation', async () => {
      const clerkUserData = {
        id: 'clerk_test_user_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com'
          }
        ],
        primaryEmailAddressId: 'email_123',
        externalAccounts: [
          {
            provider: 'linkedin'
          }
        ]
      };

      const user = await syncUserFromClerk('clerk_test_user_123', clerkUserData);

      expect(user.oauthProvider).toBe('linkedin');
    });

    it('should default to google when no external accounts', async () => {
      const clerkUserData = {
        id: 'clerk_test_user_123',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'test@example.com'
          }
        ],
        primaryEmailAddressId: 'email_123',
        externalAccounts: []
      };

      const user = await syncUserFromClerk('clerk_test_user_123', clerkUserData);

      expect(user.oauthProvider).toBe('google');
    });

    it('should throw error when no primary email is found', async () => {
      const clerkUserData = {
        id: 'clerk_test_user_123',
        emailAddresses: [],
        primaryEmailAddressId: 'email_123',
        externalAccounts: []
      };

      await expect(syncUserFromClerk('clerk_test_user_123', clerkUserData))
        .rejects.toThrow('No primary email found for user');
    });

    it('should handle missing emailAddresses array', async () => {
      const clerkUserData = {
        id: 'clerk_test_user_123',
        primaryEmailAddressId: 'email_123',
        externalAccounts: []
      };

      await expect(syncUserFromClerk('clerk_test_user_123', clerkUserData))
        .rejects.toThrow('No primary email found for user');
    });
  });

  describe('User Model Validation', () => {
    it('should require clerkUserId', async () => {
      const user = new User({
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require email', async () => {
      const user = new User({
        clerkUserId: 'clerk_test_user_123',
        role: 'alumni',
        oauthProvider: 'google'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require valid role', async () => {
      const user = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        role: 'invalid' as any,
        oauthProvider: 'google'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require valid oauthProvider', async () => {
      const user = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'invalid' as any
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique clerkUserId', async () => {
      const user1 = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test1@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await user1.save();

      const user2 = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test2@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const user1 = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await user1.save();

      const user2 = new User({
        clerkUserId: 'clerk_test_user_456',
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should default role to alumni', async () => {
      const user = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        oauthProvider: 'google'
      });
      await user.save();

      expect(user.role).toBe('alumni');
    });

    it('should transform _id to id in JSON', async () => {
      const user = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await user.save();

      const json = user.toJSON();
      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });
  });
});