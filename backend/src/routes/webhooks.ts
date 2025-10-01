import express from 'express';
import { Webhook } from 'svix';
import { User, Mentorship } from '../models';
import { logger } from '../config/logger';
import { syncUserFromClerk } from '../middleware/auth';
import { createClerkClient } from '@clerk/backend';

const router = express.Router();

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Clerk webhook endpoint
router.post('/clerk', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      logger.error('CLERK_WEBHOOK_SECRET is not configured');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    // Get the headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error('Missing svix headers');
      res.status(400).json({ error: 'Missing svix headers' });
      return;
    }

    // Get the body
    const body = req.body;
    const bodyString = body.toString();

    // Create a new Svix instance with webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(bodyString, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      logger.error('Error verifying webhook:', err);
      res.status(400).json({ error: 'Error verifying webhook' });
      return;
    }

    // Handle the webhook
    const eventType = evt.type;
    const eventData = evt.data;

    logger.info(`Received Clerk webhook: ${eventType}`, { userId: eventData.id });

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(eventData);
        break;
      case 'user.updated':
        await handleUserUpdated(eventData);
        break;
      case 'user.deleted':
        await handleUserDeleted(eventData);
        break;
      case 'session.created':
        await handleSessionCreated(eventData);
        break;
      case 'session.ended':
        await handleSessionEnded(eventData);
        break;
      default:
        logger.warn(`Unhandled webhook event type: ${eventType}`);
    }

    res.status(200).json({ 
      received: true, 
      eventType,
      userId: eventData.id 
    });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle user creation
async function handleUserCreated(userData: any) {
  try {
    const { id: clerkUserId } = userData;
    
    // Get full user data from Clerk API for accurate information
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    
    // Use the existing syncUserFromClerk function for consistency
    const user = await syncUserFromClerk(clerkUserId, clerkUser);
    
    logger.info('User created via webhook:', { 
      clerkUserId, 
      email: user.email,
      role: user.role,
      oauthProvider: user.oauthProvider 
    });

    // Set user metadata in Clerk for role-based access
    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: user.role,
        onboardingCompleted: false,
      },
      privateMetadata: {
        databaseId: user.id,
        lastSyncAt: new Date().toISOString(),
      },
      unsafeMetadata: {
        role: user.role,
        databaseId: user.id,
      },
    });

    // Log user creation for audit trail
    logger.info('User successfully created and synced:', {
      clerkUserId,
      databaseId: user.id,
      email: user.email,
      role: user.role,
      oauthProvider: user.oauthProvider,
      createdAt: user.createdAt,
    });

  } catch (error) {
    logger.error('Error creating user via webhook:', error);
    throw error;
  }
}

// Handle user updates
async function handleUserUpdated(userData: any) {
  try {
    const { id: clerkUserId } = userData;
    
    // Get full user data from Clerk API
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    
    // Sync user data using existing function
    const user = await syncUserFromClerk(clerkUserId, clerkUser);
    
    // Update user metadata in Clerk with comprehensive information
    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: user.role,
        onboardingCompleted: true,
      },
      privateMetadata: {
        databaseId: user.id,
        lastSyncAt: new Date().toISOString(),
        lastUpdatedAt: user.updatedAt.toISOString(),
      },
      unsafeMetadata: {
        role: user.role,
        databaseId: user.id,
      },
    });

    logger.info('User updated via webhook:', { 
      clerkUserId, 
      email: user.email,
      role: user.role,
      lastSyncAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating user via webhook:', error);
    throw error;
  }
}

// Handle user deletion
async function handleUserDeleted(userData: any) {
  try {
    const { id: clerkUserId } = userData;
    
    // Find user before deletion for cleanup
    const userToDelete = await User.findOne({ clerkUserId });
    if (!userToDelete) {
      logger.warn('User not found for deletion:', clerkUserId);
      return;
    }

    // Clean up related data before deleting user
    await cleanupUserRelatedData(userToDelete.id);
    
    // Delete user from database
    const deletedUser = await User.findOneAndDelete({ clerkUserId });

    logger.info('User deleted via webhook with cleanup:', { 
      clerkUserId, 
      email: deletedUser?.email,
      databaseId: userToDelete.id,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error deleting user via webhook:', error);
    throw error;
  }
}

// Helper function to clean up user-related data
async function cleanupUserRelatedData(userId: string) {
  try {
    // Import models dynamically to avoid circular dependencies
    const { AlumniProfile } = await import('../models/AlumniProfile');
    const { Event } = await import('../models/Event');
    const { Donation } = await import('../models/Donation');
    const { Communication } = await import('../models/Communication');

    // Delete alumni profile if exists
    await AlumniProfile.findOneAndDelete({ userId });
    
    // Update events created by this user (set to null or admin)
    await Event.updateMany(
      { createdBy: userId },
      { $unset: { createdBy: 1 } }
    );
    
    // Update donations by this user
    await Donation.updateMany(
      { donorId: userId },
      { $unset: { donorId: 1 } }
    );
    
    // Update communications created by this user
    await Communication.updateMany(
      { createdBy: userId },
      { $unset: { createdBy: 1 } }
    );
    
    // Remove mentorship connections
    await Mentorship.deleteMany({
      $or: [{ mentorId: userId }, { menteeId: userId }]
    });

    logger.info('User related data cleaned up:', { userId });
  } catch (error) {
    logger.error('Error cleaning up user related data:', error);
    throw error;
  }
}

// Handle session creation (for audit logging)
async function handleSessionCreated(sessionData: any) {
  try {
    const { user_id: clerkUserId } = sessionData;
    
    logger.info('User session created:', { 
      clerkUserId,
      sessionId: sessionData.id 
    });
  } catch (error) {
    logger.error('Error handling session creation:', error);
  }
}

// Handle session end (for audit logging)
async function handleSessionEnded(sessionData: any) {
  try {
    const { user_id: clerkUserId } = sessionData;
    
    logger.info('User session ended:', { 
      clerkUserId,
      sessionId: sessionData.id 
    });
  } catch (error) {
    logger.error('Error handling session end:', error);
  }
}

export default router;