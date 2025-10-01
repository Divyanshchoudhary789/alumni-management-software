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
    const { page = 1, limit = 20, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit))); // Cap at 100
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (role && ['admin', 'alumni'].includes(role as string)) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { clerkUserId: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sortObj: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'email', 'role'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    sortObj[sortField as string] = sortOrder === 'asc' ? 1 : -1;

    const [users, total, roleStats] = await Promise.all([
      User.find(query)
        .select('clerkUserId email role oauthProvider createdAt updatedAt')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
    ]);

    // Get additional user stats
    const stats = {
      total,
      roles: roleStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      recentSignups: await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
    };

    return res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      stats,
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

    // Delete user from Clerk first
    try {
      await clerkClient.users.deleteUser(user.clerkUserId);
    } catch (clerkError) {
      logger.warn('Failed to delete user from Clerk:', clerkError);
      // Continue with database deletion even if Clerk deletion fails
    }

    await User.findByIdAndDelete(user._id);

    logger.info('User deleted:', { deletedBy: req.user?.clerkUserId, deletedUser: user.clerkUserId });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Bulk update user roles (admin only)
router.put('/users/bulk-role', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userIds, role } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    if (!['admin', 'alumni'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or alumni' });
    }

    // Prevent self-demotion from admin
    const currentUserInList = await User.findOne({
      clerkUserId: req.user?.clerkUserId,
      _id: { $in: userIds }
    });

    if (currentUserInList && req.user?.role === 'admin' && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot demote yourself from admin role' });
    }

    // Update users in database
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { role, updatedAt: new Date() }
    );

    // Update metadata in Clerk for each user
    const users = await User.find({ _id: { $in: userIds } });
    const clerkUpdates = users.map(async (user) => {
      try {
        await clerkClient.users.updateUserMetadata(user.clerkUserId, {
          publicMetadata: { role },
          privateMetadata: { lastSyncAt: new Date().toISOString() },
          unsafeMetadata: { role, databaseId: user.id },
        });
      } catch (error) {
        logger.warn('Failed to update Clerk metadata for user:', user.clerkUserId, error);
      }
    });

    await Promise.allSettled(clerkUpdates);

    logger.info('Bulk role update:', {
      updatedBy: req.user?.clerkUserId,
      userIds,
      newRole: role,
      modifiedCount: result.modifiedCount,
    });

    return res.json({
      message: `Successfully updated ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('Error bulk updating user roles:', error);
    return res.status(500).json({ error: 'Failed to update user roles' });
  }
});

// Get user activity summary (admin only)
router.get('/users/:userId/activity', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      $or: [{ _id: userId }, { clerkUserId: userId }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get activity summary from various collections
    // This would typically involve aggregating data from events, donations, etc.
    const activity = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: user.updatedAt,
      },
      summary: {
        eventsCreated: 0, // Would be calculated from events collection
        donationsMade: 0, // Would be calculated from donations collection
        communicationsSent: 0, // Would be calculated from communications collection
        mentorshipConnections: 0, // Would be calculated from mentorship collection
      },
    };

    return res.json(activity);
  } catch (error) {
    logger.error('Error getting user activity:', error);
    return res.status(500).json({ error: 'Failed to get user activity' });
  }
});

// Force sync user from Clerk (admin only)
router.post('/users/:userId/sync', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      $or: [{ _id: userId }, { clerkUserId: userId }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get latest data from Clerk and sync
    const clerkUser = await clerkClient.users.getUser(user.clerkUserId);
    const syncedUser = await syncUserFromClerk(user.clerkUserId, clerkUser);

    logger.info('User force synced:', {
      syncedBy: req.user?.clerkUserId,
      targetUser: user.clerkUserId,
    });

    return res.json({
      message: 'User synced successfully',
      user: {
        id: syncedUser.id,
        clerkUserId: syncedUser.clerkUserId,
        email: syncedUser.email,
        role: syncedUser.role,
        oauthProvider: syncedUser.oauthProvider,
        updatedAt: syncedUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error('Error force syncing user:', error);
    return res.status(500).json({ error: 'Failed to sync user' });
  }
});

export default router;
