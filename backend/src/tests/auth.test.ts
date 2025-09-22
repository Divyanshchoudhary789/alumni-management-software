import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import { User } from '../models';
import { syncUserFromClerk } from '../middleware/auth';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock Clerk
const mockClerkMiddleware = (req: any, res: any, next: any) => {
  req.auth = { userId: 'clerk_test_user_123' };
  next();
};

jest.mock('@clerk/express', () => ({
  ClerkExpressRequireAuth: jest.fn(() => mockClerkMiddleware),
  ClerkExpressWithAuth: jest.fn(() => mockClerkMiddleware),
  clerkClient: {
    users: {
      getUser: jest.fn().mockResolvedValue({
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
      })
    }
  }
}));

// Mock svix for webhook testing
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn().mockReturnValue({
      type: 'user.created',
      data: {
        id: 'clerk_test_user_123',
        email_addresses: [
          {
            id: 'email_123',
            email_address: 'test@example.com'
          }
        ],
        primary_email_address_id: 'email_123',
        external_accounts: [
          {
            provider: 'oauth_google'
          }
        ]
      }
    })
  }))
}));

describe('Auth Integration Tests', () => {
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
  });

  describe('Webhook Endpoints', () => {
    beforeEach(() => {
      process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';
    });

    it('should handle user.created webhook', async () => {
      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set('svix-id', 'test_id')
        .set('svix-timestamp', '1234567890')
        .set('svix-signature', 'test_signature')
        .send({
          type: 'user.created',
          data: {
            id: 'clerk_test_user_123',
            email_addresses: [
              {
                id: 'email_123',
                email_address: 'test@example.com'
              }
            ],
            primary_email_address_id: 'email_123',
            external_accounts: [
              {
                provider: 'oauth_google'
              }
            ]
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);

      // Verify user was created
      const user = await User.findOne({ clerkUserId: 'clerk_test_user_123' });
      expect(user).toBeTruthy();
      expect(user?.email).toBe('test@example.com');
    });

    it('should handle user.updated webhook', async () => {
      // Create existing user
      const existingUser = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'old@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await existingUser.save();

      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set('svix-id', 'test_id')
        .set('svix-timestamp', '1234567890')
        .set('svix-signature', 'test_signature')
        .send({
          type: 'user.updated',
          data: {
            id: 'clerk_test_user_123',
            email_addresses: [
              {
                id: 'email_123',
                email_address: 'updated@example.com'
              }
            ],
            primary_email_address_id: 'email_123',
            external_accounts: [
              {
                provider: 'oauth_linkedin'
              }
            ]
          }
        });

      expect(response.status).toBe(200);

      // Verify user was updated
      const user = await User.findOne({ clerkUserId: 'clerk_test_user_123' });
      expect(user?.email).toBe('updated@example.com');
      expect(user?.oauthProvider).toBe('linkedin');
    });

    it('should handle user.deleted webhook', async () => {
      // Create existing user
      const existingUser = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await existingUser.save();

      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set('svix-id', 'test_id')
        .set('svix-timestamp', '1234567890')
        .set('svix-signature', 'test_signature')
        .send({
          type: 'user.deleted',
          data: {
            id: 'clerk_test_user_123'
          }
        });

      expect(response.status).toBe(200);

      // Verify user was deleted
      const user = await User.findOne({ clerkUserId: 'clerk_test_user_123' });
      expect(user).toBeNull();
    });

    it('should reject webhook with missing headers', async () => {
      const response = await request(app)
        .post('/api/webhooks/clerk')
        .send({
          type: 'user.created',
          data: { id: 'test' }
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing svix headers');
    });

    it('should reject webhook when secret is not configured', async () => {
      delete process.env.CLERK_WEBHOOK_SECRET;

      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set('svix-id', 'test_id')
        .set('svix-timestamp', '1234567890')
        .set('svix-signature', 'test_signature')
        .send({
          type: 'user.created',
          data: { id: 'test' }
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Webhook secret not configured');
    });
  });

  describe('Auth API Endpoints', () => {
    beforeEach(async () => {
      // Create test user
      const testUser = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await testUser.save();
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(200);

      expect(response.body.clerkUserId).toBe('clerk_test_user_123');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.role).toBe('alumni');
    });

    it('should sync user data from Clerk', async () => {
      const response = await request(app)
        .post('/api/auth/sync')
        .expect(200);

      expect(response.body.message).toBe('User synced successfully');
      expect(response.body.user.clerkUserId).toBe('clerk_test_user_123');
    });

    it('should update user role (admin only)', async () => {
      // Create admin user
      const adminUser = new User({
        clerkUserId: 'clerk_admin_123',
        email: 'admin@example.com',
        role: 'admin',
        oauthProvider: 'google'
      });
      await adminUser.save();

      // Mock admin authentication - this test needs to be updated to properly mock admin user

      const response = await request(app)
        .put('/api/auth/role')
        .send({
          userId: 'clerk_test_user_123',
          role: 'admin'
        })
        .expect(200);

      expect(response.body.message).toBe('User role updated successfully');
      expect(response.body.user.role).toBe('admin');
    });

    it('should get all users (admin only)', async () => {
      // Create admin user
      const adminUser = new User({
        clerkUserId: 'clerk_admin_123',
        email: 'admin@example.com',
        role: 'admin',
        oauthProvider: 'google'
      });
      await adminUser.save();

      const response = await request(app)
        .get('/api/auth/users')
        .expect(200);

      expect(response.body.users).toHaveLength(2); // test user + admin user
      expect(response.body.pagination).toBeDefined();
    });
  });
});