import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { User, IUser } from '../models';
import { logger } from '../config/logger';

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});



// Extend Express Request interface
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

// Middleware: Require Authentication
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if we're in development mode and have dev auth header
    const isDevMode = process.env.NODE_ENV === 'development';
    const devToken = req.headers['x-dev-token'] as string;

    if (isDevMode && devToken) {
      // In development mode, accept dev token with user info
      try {
        const devUser = JSON.parse(devToken);
        logger.info('Dev auth successful for user:', devUser.id);
        req.auth = {
          userId: devUser.id,
          sessionId: 'dev-session',
        };
        return next();
      } catch (error) {
        logger.warn('Invalid dev token format:', error, 'Token:', devToken);
        return res.status(401).json({ error: 'Invalid development token' });
      }
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No authorization token provided' });

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid || '',
    };

    return next();
  } catch (error) {
    logger.error('Clerk authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware: Optional Authentication
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

    return next();
  } catch (error) {
    logger.warn('Optional auth failed:', error);
    return next();
  }
};

// Middleware: Load user from DB after Clerk auth
export const loadUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized - No user ID' });
    }

    const isDevMode = process.env.NODE_ENV === 'development';
    const devToken = req.headers['x-dev-token'] as string;

    let user;

    if (isDevMode && devToken) {
      // In development mode, create or find user based on dev token
      try {
        const devUser = JSON.parse(devToken);
        const clerkUserId = devUser.id;

        user = await User.findOne({ clerkUserId });

        if (!user) {
          // Create user from dev data
          user = new User({
            clerkUserId,
            email: devUser.emailAddresses?.[0]?.emailAddress || devUser.email,
            role: devUser.publicMetadata?.role || 'alumni',
            oauthProvider: 'dev',
          });
          await user.save();
          logger.info('Dev user created:', { clerkUserId, email: user.email });
        }

        req.clerkUserId = clerkUserId;
      } catch (error) {
        logger.error('Error parsing dev token:', error);
        return res.status(401).json({ error: 'Invalid development token' });
      }
    } else {
      // Production mode - find existing user
      const clerkUserId = req.auth.userId;
      req.clerkUserId = clerkUserId;

      user = await User.findOne({ clerkUserId });
      if (!user) {
        logger.warn('User not found in database:', clerkUserId);
        return res.status(404).json({ error: 'User not found' });
      }
    }

    req.user = user;
    return next();
  } catch (error) {
    logger.error('Error loading user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware: Require Admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized - User not loaded' });

  if (req.user.role !== 'admin') {
    logger.warn('Access denied - Admin required:', { userId: req.user.clerkUserId, role: req.user.role });
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  return next();
};

// Middleware: Require Alumni role (or Admin)
export const requireAlumni = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized - User not loaded' });

  if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
    logger.warn('Access denied - Alumni access required:', { userId: req.user.clerkUserId, role: req.user.role });
    return res.status(403).json({ error: 'Forbidden - Alumni access required' });
  }

  return next();
};

// Combined middleware
export const authenticatedRoute = [requireAuth, loadUser];
export const adminRoute = [requireAuth, loadUser, requireAdmin];
export const alumniRoute = [requireAuth, loadUser, requireAlumni];

// Utility: Sync user from Clerk to DB
export const syncUserFromClerk = async (clerkUserId: string, clerkUserData: any): Promise<IUser> => {
  try {
    let user = await User.findOne({ clerkUserId });

    const primaryEmail = clerkUserData.emailAddresses?.find(
      (email: any) => email.id === clerkUserData.primaryEmailAddressId
    );

    if (!primaryEmail) throw new Error('No primary email found for user');

    let oauthProvider: 'google' | 'linkedin' = 'google';
    if (clerkUserData.externalAccounts?.length > 0) {
      const provider = clerkUserData.externalAccounts[0].provider;
      if (provider === 'oauth_linkedin' || provider === 'linkedin') oauthProvider = 'linkedin';
    }

    if (user) {
      user.email = primaryEmail.emailAddress;
      user.oauthProvider = oauthProvider;
      await user.save();
      logger.info('User synced from Clerk:', { clerkUserId, email: user.email });
    } else {
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
