import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
import { User, IUser } from '../models';
import { logger } from '../config/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      clerkUserId?: string;
      auth?: {
        userId: string;
        sessionId: string;
      };
    }
  }
}

// Middleware to require authentication
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid || '',
    };

    next();
  } catch (error) {
    logger.error('Clerk authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to optionally check authentication
export const withAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      req.auth = {
        userId: payload.sub,
        sessionId: payload.sid || '',
      };
    }

    next();
  } catch (error) {
    logger.warn('Optional auth failed:', error);
    next();
  }
};

// Middleware to load user from database after Clerk authentication
export const loadUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID' });
    }

    const clerkUserId = req.auth.userId;
    req.clerkUserId = clerkUserId;

    // Find user in database
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      logger.warn('User not found in database:', clerkUserId);
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error loading user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to require admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - User not loaded' });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Access denied - Admin required:', { userId: req.user.clerkUserId, role: req.user.role });
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  next();
};

// Middleware to require alumni role (or admin)
export const requireAlumni = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - User not loaded' });
  }

  if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
    logger.warn('Access denied - Alumni access required:', { userId: req.user.clerkUserId, role: req.user.role });
    return res.status(403).json({ error: 'Forbidden - Alumni access required' });
  }

  next();
};

// Combined middleware for authenticated routes with user loading
export const authenticatedRoute = [requireAuth, loadUser];

// Combined middleware for admin routes
export const adminRoute = [requireAuth, loadUser, requireAdmin];

// Combined middleware for alumni routes
export const alumniRoute = [requireAuth, loadUser, requireAlumni];

// Utility function to sync user from Clerk to database
export const syncUserFromClerk = async (clerkUserId: string, clerkUserData: any): Promise<IUser> => {
  try {
    // Check if user exists
    let user = await User.findOne({ clerkUserId });

    // Get primary email
    const primaryEmail = clerkUserData.emailAddresses?.find(
      (email: any) => email.id === clerkUserData.primaryEmailAddressId
    );

    if (!primaryEmail) {
      throw new Error('No primary email found for user');
    }

    // Determine OAuth provider
    let oauthProvider: 'google' | 'linkedin' = 'google';
    if (clerkUserData.externalAccounts && clerkUserData.externalAccounts.length > 0) {
      const provider = clerkUserData.externalAccounts[0].provider;
      if (provider === 'oauth_linkedin' || provider === 'linkedin') {
        oauthProvider = 'linkedin';
      }
    }

    if (user) {
      // Update existing user
      user.email = primaryEmail.emailAddress;
      user.oauthProvider = oauthProvider;
      await user.save();
      logger.info('User synced from Clerk:', { clerkUserId, email: user.email });
    } else {
      // Create new user
      user = new User({
        clerkUserId,
        email: primaryEmail.emailAddress,
        role: 'alumni',
        oauthProvider,
      });
      await user.save();
      logger.info('New user created from Clerk sync:', { clerkUserId, email: user.email });
    }

    return user;
  } catch (error) {
    logger.error('Error syncing user from Clerk:', error);
    throw error;
  }
};