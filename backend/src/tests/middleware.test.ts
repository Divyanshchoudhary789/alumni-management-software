import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models';
import { loadUser, requireAdmin, requireAlumni, syncUserFromClerk } from '../middleware/auth';

// Mock Clerk
jest.mock('@clerk/express', () => ({
  ClerkExpressRequireAuth: jest.fn(() => (req: any, res: any, next: any) => {
    req.auth = { userId: 'clerk_test_user_123' };
    next();
  }),
  ClerkExpressWithAuth: jest.fn(() => (req: any, res: any, next: any) => {
    req.auth = { userId: 'clerk_test_user_123' };
    next();
  }),
}));

describe('Authentication Middleware Tests', () => {
  let mongoServer: MongoMemoryServer;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

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
    
    // Setup mock request, response, and next
    req = {
      auth: { userId: 'clerk_test_user_123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('loadUser middleware', () => {
    it('should load user successfully when user exists', async () => {
      // Create test user
      const testUser = new User({
        clerkUserId: 'clerk_test_user_123',
        email: 'test@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await testUser.save();

      await loadUser(req as Request, res as Response, next);

      expect(req.clerkUserId).toBe('clerk_test_user_123');
      expect(req.user).toBeDefined();
      expect(req.user?.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when no auth userId', async () => {
      req.auth = undefined;

      await loadUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - No user ID' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found in database', async () => {
      await loadUser(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin middleware', () => {
    it('should allow access for admin user', () => {
      req.user = {
        clerkUserId: 'clerk_test_user_123',
        email: 'admin@example.com',
        role: 'admin',
        oauthProvider: 'google'
      } as any;

      requireAdmin(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access for non-admin user', () => {
      req.user = {
        clerkUserId: 'clerk_test_user_123',
        email: 'user@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      } as any;

      requireAdmin(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden - Admin access required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user not loaded', () => {
      req.user = undefined;

      requireAdmin(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - User not loaded' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAlumni middleware', () => {
    it('should allow access for alumni user', () => {
      req.user = {
        clerkUserId: 'clerk_test_user_123',
        email: 'alumni@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      } as any;

      requireAlumni(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow access for admin user', () => {
      req.user = {
        clerkUserId: 'clerk_test_user_123',
        email: 'admin@example.com',
        role: 'admin',
        oauthProvider: 'google'
      } as any;

      requireAlumni(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access for invalid role', () => {
      req.user = {
        clerkUserId: 'clerk_test_user_123',
        email: 'user@example.com',
        role: 'invalid' as any,
        oauthProvider: 'google'
      } as any;

      requireAlumni(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden - Alumni access required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user not loaded', () => {
      req.user = undefined;

      requireAlumni(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - User not loaded' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('syncUserFromClerk function', () => {
    it('should create new user from Clerk data', async () => {
      const clerkUserData = {
        id: 'clerk_new_user_456',
        emailAddresses: [
          {
            id: 'email_456',
            emailAddress: 'newuser@example.com'
          }
        ],
        primaryEmailAddressId: 'email_456',
        externalAccounts: [
          {
            provider: 'oauth_google'
          }
        ]
      };

      const user = await syncUserFromClerk('clerk_new_user_456', clerkUserData);

      expect(user).toBeDefined();
      expect(user.clerkUserId).toBe('clerk_new_user_456');
      expect(user.email).toBe('newuser@example.com');
      expect(user.role).toBe('alumni');
      expect(user.oauthProvider).toBe('google');

      // Verify user was saved to database
      const savedUser = await User.findOne({ clerkUserId: 'clerk_new_user_456' });
      expect(savedUser).toBeTruthy();
    });

    it('should update existing user from Clerk data', async () => {
      // Create existing user
      const existingUser = new User({
        clerkUserId: 'clerk_existing_user_789',
        email: 'old@example.com',
        role: 'alumni',
        oauthProvider: 'google'
      });
      await existingUser.save();

      const clerkUserData = {
        id: 'clerk_existing_user_789',
        emailAddresses: [
          {
            id: 'email_789',
            emailAddress: 'updated@example.com'
          }
        ],
        primaryEmailAddressId: 'email_789',
        externalAccounts: [
          {
            provider: 'oauth_linkedin'
          }
        ]
      };

      const user = await syncUserFromClerk('clerk_existing_user_789', clerkUserData);

      expect(user.email).toBe('updated@example.com');
      expect(user.oauthProvider).toBe('linkedin');

      // Verify only one user exists
      const userCount = await User.countDocuments({ clerkUserId: 'clerk_existing_user_789' });
      expect(userCount).toBe(1);
    });

    it('should handle missing primary email', async () => {
      const clerkUserData = {
        id: 'clerk_no_email_user',
        emailAddresses: [],
        primaryEmailAddressId: 'nonexistent_email',
        externalAccounts: []
      };

      await expect(syncUserFromClerk('clerk_no_email_user', clerkUserData))
        .rejects.toThrow('No primary email found for user');
    });

    it('should default to google provider when no external accounts', async () => {
      const clerkUserData = {
        id: 'clerk_no_provider_user',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'noprovider@example.com'
          }
        ],
        primaryEmailAddressId: 'email_123',
        externalAccounts: []
      };

      const user = await syncUserFromClerk('clerk_no_provider_user', clerkUserData);

      expect(user.oauthProvider).toBe('google');
    });

    it('should handle linkedin provider variations', async () => {
      const clerkUserData1 = {
        id: 'clerk_linkedin_user_1',
        emailAddresses: [
          {
            id: 'email_123',
            emailAddress: 'linkedin1@example.com'
          }
        ],
        primaryEmailAddressId: 'email_123',
        externalAccounts: [
          {
            provider: 'oauth_linkedin'
          }
        ]
      };

      const clerkUserData2 = {
        id: 'clerk_linkedin_user_2',
        emailAddresses: [
          {
            id: 'email_456',
            emailAddress: 'linkedin2@example.com'
          }
        ],
        primaryEmailAddressId: 'email_456',
        externalAccounts: [
          {
            provider: 'linkedin'
          }
        ]
      };

      const user1 = await syncUserFromClerk('clerk_linkedin_user_1', clerkUserData1);
      const user2 = await syncUserFromClerk('clerk_linkedin_user_2', clerkUserData2);

      expect(user1.oauthProvider).toBe('linkedin');
      expect(user2.oauthProvider).toBe('linkedin');
    });
  });
});