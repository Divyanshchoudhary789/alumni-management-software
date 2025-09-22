import express, { Request, Response } from 'express';
import { 
  MentorshipConnection, 
  MentorProfile, 
  MenteeProfile,
  IMentorshipConnection,
  IMentorProfile,
  IMenteeProfile
} from '../models/Mentorship';
import { AlumniProfile } from '../models/AlumniProfile';
import { authenticatedRoute, adminRoute, requireAlumni } from '../middleware/auth';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/mentorship/connections - List mentorship connections
router.get('/connections', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query based on user role
    let query: any = {};
    
    if (req.user?.role === 'admin') {
      // Admin can see all connections
      if (status) query.status = status;
    } else {
      // Alumni can only see their own connections
      query.$or = [
        { mentorId: req.user!._id },
        { menteeId: req.user!._id }
      ];
      if (status) query.status = status;
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [connections, total] = await Promise.all([
      MentorshipConnection.find(query)
        .populate({
          path: 'mentorId',
          populate: {
            path: 'alumniId',
            select: 'firstName lastName currentCompany currentPosition'
          }
        })
        .populate({
          path: 'menteeId',
          populate: {
            path: 'alumniId',
            select: 'firstName lastName graduationYear'
          }
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MentorshipConnection.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      connections,
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
    logger.error('Error fetching mentorship connections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mentorship/mentors - List available mentors
router.get('/mentors', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      expertise,
      industry,
      experience,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { 
      isActive: true,
      $expr: { $lt: ['$currentMentees', '$maxMentees'] } // Available mentors only
    };

    // Filters
    if (expertise) {
      const expertiseArray = (expertise as string).split(',').map(e => e.trim());
      query.expertise = { $in: expertiseArray };
    }

    if (industry) {
      const industryArray = (industry as string).split(',').map(i => i.trim());
      query.industries = { $in: industryArray };
    }

    if (experience) {
      query.yearsOfExperience = { $gte: parseInt(experience as string) };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [mentors, total] = await Promise.all([
      MentorProfile.find(query)
        .populate({
          path: 'alumniId',
          select: 'firstName lastName currentCompany currentPosition profileImage bio'
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MentorProfile.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      mentors,
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
    logger.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mentorship/mentors/:id - Get specific mentor profile
router.get('/mentors/:id', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    const mentor = await MentorProfile.findById(id)
      .populate({
        path: 'alumniId',
        select: 'firstName lastName currentCompany currentPosition profileImage bio graduationYear'
      })
      .lean();

    if (!mentor || !mentor.isActive) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Check if current user already has a connection with this mentor
    const existingConnection = await MentorshipConnection.findOne({
      mentorId: id,
      menteeId: req.user!._id,
      status: { $in: ['pending', 'active'] }
    });

    res.json({
      ...mentor,
      hasExistingConnection: !!existingConnection,
      existingConnection
    });
  } catch (error) {
    logger.error('Error fetching mentor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mentorship/mentors - Create mentor profile
router.post('/mentors', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const {
      expertise = [],
      industries = [],
      yearsOfExperience,
      maxMentees = 3,
      bio,
      availableHours = [],
      preferredCommunication = []
    } = req.body;

    // Validate required fields
    if (!yearsOfExperience || !bio) {
      return res.status(400).json({ 
        error: 'Missing required fields: yearsOfExperience, bio' 
      });
    }

    // Check if mentor profile already exists
    const existingProfile = await MentorProfile.findOne({ alumniId: req.user!._id });
    if (existingProfile) {
      return res.status(409).json({ error: 'Mentor profile already exists' });
    }

    const mentorProfile = new MentorProfile({
      alumniId: req.user!._id,
      expertise,
      industries,
      yearsOfExperience,
      maxMentees,
      bio,
      availableHours,
      preferredCommunication
    });

    await mentorProfile.save();
    await mentorProfile.populate('alumniId', 'firstName lastName currentCompany');

    logger.info('Mentor profile created:', { 
      mentorId: mentorProfile._id, 
      alumniId: req.user!._id 
    });
    res.status(201).json(mentorProfile);
  } catch (error) {
    logger.error('Error creating mentor profile:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/mentorship/mentees - Create mentee profile
router.post('/mentees', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const {
      goals = [],
      interestedIndustries = [],
      careerStage,
      bio,
      preferredCommunication = []
    } = req.body;

    // Validate required fields
    if (!careerStage || !bio) {
      return res.status(400).json({ 
        error: 'Missing required fields: careerStage, bio' 
      });
    }

    // Check if mentee profile already exists
    const existingProfile = await MenteeProfile.findOne({ alumniId: req.user!._id });
    if (existingProfile) {
      return res.status(409).json({ error: 'Mentee profile already exists' });
    }

    const menteeProfile = new MenteeProfile({
      alumniId: req.user!._id,
      goals,
      interestedIndustries,
      careerStage,
      bio,
      preferredCommunication
    });

    await menteeProfile.save();
    await menteeProfile.populate('alumniId', 'firstName lastName graduationYear');

    logger.info('Mentee profile created:', { 
      menteeId: menteeProfile._id, 
      alumniId: req.user!._id 
    });
    res.status(201).json(menteeProfile);
  } catch (error) {
    logger.error('Error creating mentee profile:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/mentorship/connections - Request mentorship connection
router.post('/connections', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const { mentorId, notes } = req.body;

    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    // Verify mentor exists and is available
    const mentor = await MentorProfile.findById(mentorId);
    if (!mentor || !mentor.isActive) {
      return res.status(404).json({ error: 'Mentor not found or not available' });
    }

    if (mentor.currentMentees >= mentor.maxMentees) {
      return res.status(400).json({ error: 'Mentor has reached maximum mentee capacity' });
    }

    // Check if connection already exists
    const existingConnection = await MentorshipConnection.findOne({
      mentorId,
      menteeId: req.user!._id
    });

    if (existingConnection) {
      if (existingConnection.status === 'cancelled') {
        // Reactivate cancelled connection
        existingConnection.status = 'pending';
        existingConnection.notes = notes;
        await existingConnection.save();
        
        logger.info('Mentorship connection reactivated:', { 
          connectionId: existingConnection._id,
          mentorId,
          menteeId: req.user!._id
        });
        res.json(existingConnection);
      } else {
        return res.status(409).json({ error: 'Connection already exists' });
      }
    } else {
      // Create new connection
      const connection = new MentorshipConnection({
        mentorId,
        menteeId: req.user!._id,
        notes,
        status: 'pending'
      });

      await connection.save();
      
      logger.info('Mentorship connection requested:', { 
        connectionId: connection._id,
        mentorId,
        menteeId: req.user!._id
      });
      res.status(201).json(connection);
    }
  } catch (error) {
    logger.error('Error creating mentorship connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/mentorship/connections/:id/status - Update connection status
router.put('/connections/:id/status', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const connection = await MentorshipConnection.findById(id)
      .populate('mentorId')
      .populate('menteeId');

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check permissions - only mentor, mentee, or admin can update
    const isMentor = connection.mentorId.alumniId.toString() === req.user!._id.toString();
    const isMentee = connection.menteeId.alumniId.toString() === req.user!._id.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isMentor && !isMentee && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden - Not authorized to update this connection' });
    }

    // Update connection
    const oldStatus = connection.status;
    connection.status = status;
    if (startDate) connection.startDate = new Date(startDate);
    if (endDate) connection.endDate = new Date(endDate);

    await connection.save();

    // Update mentor's current mentee count
    if (oldStatus !== 'active' && status === 'active') {
      await MentorProfile.findByIdAndUpdate(
        connection.mentorId._id,
        { $inc: { currentMentees: 1 } }
      );
    } else if (oldStatus === 'active' && status !== 'active') {
      await MentorProfile.findByIdAndUpdate(
        connection.mentorId._id,
        { $inc: { currentMentees: -1 } }
      );
    }

    logger.info('Mentorship connection status updated:', { 
      connectionId: connection._id,
      oldStatus,
      newStatus: status,
      updatedBy: req.user!._id
    });
    res.json(connection);
  } catch (error) {
    logger.error('Error updating mentorship connection status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mentorship/connections/:id/feedback - Add feedback to connection
router.post('/connections/:id/feedback', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }

    const connection = await MentorshipConnection.findById(id)
      .populate('mentorId')
      .populate('menteeId');

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check permissions and determine feedback type
    const isMentor = connection.mentorId.alumniId.toString() === req.user!._id.toString();
    const isMentee = connection.menteeId.alumniId.toString() === req.user!._id.toString();

    if (!isMentor && !isMentee) {
      return res.status(403).json({ error: 'Forbidden - Not authorized to add feedback' });
    }

    // Add feedback based on user role
    if (isMentor) {
      connection.mentorFeedback = feedback;
    } else {
      connection.menteeFeedback = feedback;
      if (rating) connection.rating = rating;
    }

    await connection.save();

    logger.info('Mentorship feedback added:', { 
      connectionId: connection._id,
      feedbackBy: isMentor ? 'mentor' : 'mentee',
      userId: req.user!._id
    });
    res.json(connection);
  } catch (error) {
    logger.error('Error adding mentorship feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mentorship/stats/overview - Get mentorship statistics (admin only)
router.get('/stats/overview', adminRoute, async (req: Request, res: Response) => {
  try {
    const [
      totalConnections,
      activeConnections,
      pendingConnections,
      completedConnections,
      totalMentors,
      activeMentors,
      totalMentees,
      recentConnections,
      averageRating
    ] = await Promise.all([
      MentorshipConnection.countDocuments(),
      MentorshipConnection.countDocuments({ status: 'active' }),
      MentorshipConnection.countDocuments({ status: 'pending' }),
      MentorshipConnection.countDocuments({ status: 'completed' }),
      MentorProfile.countDocuments(),
      MentorProfile.countDocuments({ isActive: true }),
      MenteeProfile.countDocuments({ isActive: true }),
      MentorshipConnection.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      MentorshipConnection.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const avgRating = averageRating[0]?.avgRating || 0;

    res.json({
      totalConnections,
      activeConnections,
      pendingConnections,
      completedConnections,
      totalMentors,
      activeMentors,
      totalMentees,
      recentConnections,
      averageRating: Math.round(avgRating * 10) / 10
    });
  } catch (error) {
    logger.error('Error fetching mentorship statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;