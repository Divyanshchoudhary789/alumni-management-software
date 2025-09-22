import express from 'express';
import { Webhook } from 'svix';
import { User } from '../models';
import { logger } from '../config/logger';

const router = express.Router();

// Clerk webhook endpoint
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      logger.error('CLERK_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Get the headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error('Missing svix headers');
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Get the body
    const body = req.body;

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      logger.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
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
      default:
        logger.warn(`Unhandled webhook event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle user creation
async function handleUserCreated(userData: any) {
  try {
    const { id: clerkUserId, email_addresses, external_accounts } = userData;
    
    // Get primary email
    const primaryEmail = email_addresses?.find((email: any) => email.id === userData.primary_email_address_id);
    if (!primaryEmail) {
      logger.error('No primary email found for user:', clerkUserId);
      return;
    }

    // Determine OAuth provider
    let oauthProvider: 'google' | 'linkedin' = 'google'; // default
    if (external_accounts && external_accounts.length > 0) {
      const provider = external_accounts[0].provider;
      if (provider === 'oauth_linkedin' || provider === 'linkedin') {
        oauthProvider = 'linkedin';
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkUserId });
    if (existingUser) {
      logger.warn('User already exists:', clerkUserId);
      return;
    }

    // Create new user
    const newUser = new User({
      clerkUserId,
      email: primaryEmail.email_address,
      role: 'alumni', // Default role
      oauthProvider,
    });

    await newUser.save();
    logger.info('User created successfully:', { clerkUserId, email: primaryEmail.email_address });
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}

// Handle user updates
async function handleUserUpdated(userData: any) {
  try {
    const { id: clerkUserId, email_addresses, external_accounts } = userData;
    
    // Find existing user
    const existingUser = await User.findOne({ clerkUserId });
    if (!existingUser) {
      logger.warn('User not found for update:', clerkUserId);
      // Create user if it doesn't exist
      await handleUserCreated(userData);
      return;
    }

    // Get primary email
    const primaryEmail = email_addresses?.find((email: any) => email.id === userData.primary_email_address_id);
    if (primaryEmail) {
      existingUser.email = primaryEmail.email_address;
    }

    // Update OAuth provider if changed
    if (external_accounts && external_accounts.length > 0) {
      const provider = external_accounts[0].provider;
      if (provider === 'oauth_linkedin' || provider === 'linkedin') {
        existingUser.oauthProvider = 'linkedin';
      } else {
        existingUser.oauthProvider = 'google';
      }
    }

    await existingUser.save();
    logger.info('User updated successfully:', { clerkUserId, email: existingUser.email });
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
}

// Handle user deletion
async function handleUserDeleted(userData: any) {
  try {
    const { id: clerkUserId } = userData;
    
    // Find and delete user
    const deletedUser = await User.findOneAndDelete({ clerkUserId });
    if (!deletedUser) {
      logger.warn('User not found for deletion:', clerkUserId);
      return;
    }

    logger.info('User deleted successfully:', { clerkUserId, email: deletedUser.email });
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
}

export default router;