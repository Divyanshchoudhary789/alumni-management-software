import express, { Request, Response } from 'express';
import { AlumniProfile } from '../models/AlumniProfile';
import { authenticatedRoute, adminRoute } from '../middleware/auth';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

const router = express.Router();

// ----------------------------------------------
// GET /api/alumni - List alumni with filters and search
// ----------------------------------------------
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      graduationYear,
      location,
      company,
      skills,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPublic = 'true'
    } = req.query;

    const pageNum = Number(page) > 0 ? parseInt(page as string) : 1;
    const limitNum = Number(limit) > 0 ? parseInt(limit as string) : 20;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    // Public profiles logic
    if (req.user?.role !== 'admin') {
      query.isPublic = true;
    } else if (isPublic !== 'all') {
      query.isPublic = isPublic === 'true';
    }

    // Search - Enhanced search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { currentCompany: searchRegex },
        { currentPosition: searchRegex },
        { location: searchRegex },
        { degree: searchRegex },
        { skills: { $in: [searchRegex] } },
        { interests: { $in: [searchRegex] } },
        { bio: searchRegex }
      ];
    }

    // Filters
    if (graduationYear) {
      query.graduationYear = parseInt(graduationYear as string);
    }

    if (location) {
      query.location = { $regex: location as string, $options: 'i' };
    }

    if (company) {
      query.currentCompany = { $regex: company as string, $options: 'i' };
    }

    if (skills) {
      const skillsArray = (skills as string).split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Query execution
    const [alumni, total] = await Promise.all([
      AlumniProfile.find(query)
        .populate('userId', 'email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AlumniProfile.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      alumni,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    logger.error('Error fetching alumni', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------
// GET /api/alumni/stats/overview - Admin stats
// ----------------------------------------------
router.get('/stats/overview', async (req: Request, res: Response): Promise<any> => {
  try {
    const [
      totalAlumni,
      publicProfiles,
      recentAlumni,
      graduationYearStats,
      locationStats,
      companyStats
    ] = await Promise.all([
      AlumniProfile.countDocuments(),
      AlumniProfile.countDocuments({ isPublic: true }),
      AlumniProfile.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      AlumniProfile.aggregate([
        { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 10 }
      ]),
      AlumniProfile.aggregate([
        { $match: { location: { $nin: [null, ''] } } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AlumniProfile.aggregate([
        { $match: { currentCompany: { $nin: [null, ''] } } },
        { $group: { _id: '$currentCompany', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      totalAlumni,
      publicProfiles,
      privateProfiles: totalAlumni - publicProfiles,
      recentAlumni,
      graduationYearStats,
      locationStats,
      companyStats
    });
  } catch (error) {
    logger.error('Error fetching alumni statistics', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------
// POST /api/alumni - Create profile (admin only)
// ----------------------------------------------
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      userId,
      firstName,
      lastName,
      graduationYear,
      degree,
      currentCompany,
      currentPosition,
      location,
      bio,
      profileImage,
      linkedinUrl,
      websiteUrl,
      phone,
      isPublic = true,
      skills = [],
      interests = []
    } = req.body;

    if (!firstName || !lastName || !graduationYear || !degree) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, graduationYear, degree'
      });
    }

    // Handle userId - convert string to ObjectId or generate new one
    let finalUserId;
    if (userId) {
      try {
        finalUserId = new mongoose.Types.ObjectId(userId);
      } catch (error) {
        // If userId is not a valid ObjectId, generate a new one
        finalUserId = new mongoose.Types.ObjectId();
      }
    } else {
      finalUserId = new mongoose.Types.ObjectId();
    }

    const alumni = new AlumniProfile({
      userId: finalUserId,
      firstName,
      lastName,
      graduationYear,
      degree,
      currentCompany,
      currentPosition,
      location,
      bio,
      profileImage,
      linkedinUrl,
      websiteUrl,
      phone,
      isPublic,
      skills,
      interests
    });

    await alumni.save();
    await alumni.populate('userId', 'email role');

    logger.info('Alumni profile created', { alumniId: alumni._id, userId });
    res.status(201).json(alumni);
  } catch (error) {
    logger.error('Error creating alumni profile', { error });
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ----------------------------------------------
// PUT /api/alumni/:id - Update profile
// ----------------------------------------------
router.put('/:id', authenticatedRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID' });
    }

    const alumni = await AlumniProfile.findById(id);
    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    const isOwnProfile = alumni.userId.toString() === req.user?._id?.toString();
    if (req.user?.role !== 'admin' && !isOwnProfile) {
      return res.status(403).json({ error: 'Forbidden - Can only update own profile' });
    }

    const updatableFields = [
      'firstName', 'lastName', 'graduationYear', 'degree', 'currentCompany', 'currentPosition',
      'location', 'bio', 'profileImage', 'linkedinUrl', 'websiteUrl', 'phone', 'isPublic', 'skills', 'interests'
    ];
    for (const key of updatableFields) {
      if (req.body[key] !== undefined) (alumni as any)[key] = req.body[key];
    }

    await alumni.save();
    await alumni.populate('userId', 'email role');

    logger.info('Alumni profile updated', { alumniId: alumni._id, updatedBy: req.user?._id });
    res.json(alumni);
  } catch (error) {
    logger.error('Error updating alumni profile', { error });
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ----------------------------------------------
// DELETE /api/alumni/:id - Delete profile (admin only)
// ----------------------------------------------
router.delete('/:id', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID' });
    }

    const alumni = await AlumniProfile.findByIdAndDelete(id);
    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    logger.info('Alumni profile deleted', { alumniId: id, deletedBy: req.user?._id });
    res.json({ message: 'Alumni profile deleted successfully' });
  } catch (error) {
    logger.error('Error deleting alumni profile', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------
// GET /api/alumni/:id - Get profile
// (keep this last so it doesn’t override /stats/overview)
// ----------------------------------------------
router.get('/:id', authenticatedRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID' });
    }

    const alumni = await AlumniProfile.findById(id)
      .populate('userId', 'email role')
      .lean();

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    if (
      alumni.isPublic !== true &&
      req.user?.role !== 'admin' &&
      alumni.userId &&
      (alumni.userId as any)._id?.toString() !== req.user?._id?.toString()
    ) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    res.json(alumni);
  } catch (error) {
    logger.error('Error fetching alumni profile', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
