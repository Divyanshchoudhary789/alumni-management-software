import express, { Request, Response } from 'express';
import { createClerkClient } from '@clerk/backend';
import { User } from '../models';
import { authenticatedRoute, adminRoute, syncUserFromClerk } from '../middleware/auth';
import { logger } from '../config/logger';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!, // Non-null assertion
});

const router = express.Router();

// Get current user profile
router.get('/me', authenticatedRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: req.user.id,
      clerkUserId: req.user.clerkUserId,
      email: req.user.email,
      role: req.user.role,
      oauthProvider: req.user.oauthProvider,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync user data from Clerk
router.post('/sync', authenticatedRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const clerkUserId = req.clerkUserId;
    if (!clerkUserId) {
      return res.status(400).json({ error: 'No Clerk user ID found' });
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const user = await syncUserFromClerk(clerkUserId, clerkUser);

    return res.json({
      message: 'User synced successfully',
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        role: user.role,
        oauthProvider: user.oauthProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Failed to sync user data' });
  }
});

// Update user role (admin only)
router.put('/role', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }

    if (!['admin', 'alumni'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or alumni' });
    }

    const user = await User.findOne({
      $or: [{ _id: userId }, { clerkUserId: userId }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user?.clerkUserId === user.clerkUserId && req.user.role === 'admin' && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote yourself from admin role' });
    }

    user.role = role;
    await user.save();

    logger.info('User role updated:', {
      updatedBy: req.user?.clerkUserId,
      targetUser: user.clerkUserId,
      newRole: role,
    });

    return res.json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        role: user.role,
        oauthProvider: user.oauthProvider,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get all users (admin only)
router.get('/users', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (role && ['admin', 'alumni'].includes(role as string)) query.role = role;
    if (search) query.email = { $regex: search, $options: 'i' };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('clerkUserId email role oauthProvider createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    return res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    return res.status(500).json({ error: 'Failed to get users' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      $or: [{ _id: userId }, { clerkUserId: userId }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user?.clerkUserId === user.clerkUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(user._id);

    logger.info('User deleted:', { deletedBy: req.user?.clerkUserId, deletedUser: user.clerkUserId });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
