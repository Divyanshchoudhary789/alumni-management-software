import express, { Request, Response } from 'express';
import { AlumniProfile, IAlumniProfile } from '../models/AlumniProfile';
import { authenticatedRoute, adminRoute, requireAlumni } from '../middleware/auth';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/alumni - List alumni with filters and search
router.get('/', authenticatedRoute, async (req: Request, res: Response) => {
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

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Only show public profiles unless user is admin
    if (req.user?.role !== 'admin') {
      query.isPublic = true;
    } else if (isPublic !== 'all') {
      query.isPublic = isPublic === 'true';
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
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

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
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
    logger.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/alumni/:id - Get specific alumni profile
router.get('/:id', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID' });
    }

    const query: any = { _id: id };

    // Only show public profiles unless user is admin or viewing own profile
    if (req.user?.role !== 'admin') {
      const alumni = await AlumniProfile.findById(id).populate('userId');
      if (!alumni) {
        return res.status(404).json({ error: 'Alumni not found' });
      }

      // Check if user is viewing their own profile
      const isOwnProfile = alumni.userId.toString() === req.user?._id.toString();
      
      if (!alumni.isPublic && !isOwnProfile) {
        return res.status(403).json({ error: 'Profile is private' });
      }
    }

    const alumni = await AlumniProfile.findById(id)
      .populate('userId', 'email role')
      .lean();

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    res.json(alumni);
  } catch (error) {
    logger.error('Error fetching alumni profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/alumni - Create alumni profile (admin only)
router.post('/', adminRoute, async (req: Request, res: Response) => {
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

    // Validate required fields
    if (!userId || !firstName || !lastName || !graduationYear || !degree) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, firstName, lastName, graduationYear, degree' 
      });
    }

    // Check if profile already exists for this user
    const existingProfile = await AlumniProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ error: 'Alumni profile already exists for this user' });
    }

    const alumni = new AlumniProfile({
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
      isPublic,
      skills,
      interests
    });

    await alumni.save();
    await alumni.populate('userId', 'email role');

    logger.info('Alumni profile created:', { alumniId: alumni._id, userId });
    res.status(201).json(alumni);
  } catch (error) {
    logger.error('Error creating alumni profile:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/alumni/:id - Update alumni profile (admin or own profile)
router.put('/:id', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID' });
    }

    const alumni = await AlumniProfile.findById(id);
    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Check permissions - admin or own profile
    const isOwnProfile = alumni.userId.toString() === req.user?._id.toString();
    if (req.user?.role !== 'admin' && !isOwnProfile) {
      return res.status(403).json({ error: 'Forbidden - Can only update own profile' });
    }

    const {
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
    } = req.body;

    // Update fields
    if (firstName !== undefined) alumni.firstName = firstName;
    if (lastName !== undefined) alumni.lastName = lastName;
    if (graduationYear !== undefined) alumni.graduationYear = graduationYear;
    if (degree !== undefined) alumni.degree = degree;
    if (currentCompany !== undefined) alumni.currentCompany = currentCompany;
    if (currentPosition !== undefined) alumni.currentPosition = currentPosition;
    if (location !== undefined) alumni.location = location;
    if (bio !== undefined) alumni.bio = bio;
    if (profileImage !== undefined) alumni.profileImage = profileImage;
    if (linkedinUrl !== undefined) alumni.linkedinUrl = linkedinUrl;
    if (websiteUrl !== undefined) alumni.websiteUrl = websiteUrl;
    if (phone !== undefined) alumni.phone = phone;
    if (isPublic !== undefined) alumni.isPublic = isPublic;
    if (skills !== undefined) alumni.skills = skills;
    if (interests !== undefined) alumni.interests = interests;

    await alumni.save();
    await alumni.populate('userId', 'email role');

    logger.info('Alumni profile updated:', { alumniId: alumni._id, updatedBy: req.user?._id });
    res.json(alumni);
  } catch (error) {
    logger.error('Error updating alumni profile:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/alumni/:id - Delete alumni profile (admin only)
router.delete('/:id', adminRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID' });
    }

    const alumni = await AlumniProfile.findByIdAndDelete(id);
    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    logger.info('Alumni profile deleted:', { alumniId: id, deletedBy: req.user?._id });
    res.json({ message: 'Alumni profile deleted successfully' });
  } catch (error) {
    logger.error('Error deleting alumni profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/alumni/stats/overview - Get alumni statistics (admin only)
router.get('/stats/overview', adminRoute, async (req: Request, res: Response) => {
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
        { $match: { location: { $ne: null, $ne: '' } } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AlumniProfile.aggregate([
        { $match: { currentCompany: { $ne: null, $ne: '' } } },
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
    logger.error('Error fetching alumni statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;