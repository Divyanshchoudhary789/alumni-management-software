import express, { Request, Response } from 'express';
import { Donation, Campaign, IDonation, ICampaign } from '../models/Donation';
import { AlumniProfile } from '../models/AlumniProfile';
import { authenticatedRoute, adminRoute, requireAlumni } from '../middleware/auth';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/donations - List donations (admin only)
router.get('/', adminRoute, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      campaignId,
      donorId,
      sortBy = 'donationDate',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Filters
    if (status) query.status = status;
    if (campaignId) query.campaignId = campaignId;
    if (donorId) query.donorId = donorId;

    // Date range filter
    if (startDate || endDate) {
      query.donationDate = {};
      if (startDate) query.donationDate.$gte = new Date(startDate as string);
      if (endDate) query.donationDate.$lte = new Date(endDate as string);
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('donorId', 'firstName lastName email')
        .populate('campaignId', 'title')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Donation.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      donations,
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
    logger.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/donations/:id - Get specific donation (admin only)
router.get('/:id', adminRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid donation ID' });
    }

    const donation = await Donation.findById(id)
      .populate('donorId', 'firstName lastName email graduationYear')
      .populate('campaignId', 'title description')
      .lean();

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    logger.error('Error fetching donation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/donations - Create donation (authenticated users)
router.post('/', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const {
      amount,
      purpose,
      campaignId,
      paymentMethod,
      transactionId
    } = req.body;

    // Validate required fields
    if (!amount || !purpose || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, purpose, paymentMethod' 
      });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Validate campaign if provided
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      if (campaign.status !== 'active') {
        return res.status(400).json({ error: 'Campaign is not active' });
      }
    }

    const donation = new Donation({
      donorId: req.user!._id,
      amount,
      purpose,
      campaignId: campaignId || undefined,
      paymentMethod,
      transactionId,
      status: 'pending' // Will be updated by payment processor
    });

    await donation.save();
    await donation.populate('donorId', 'firstName lastName email');
    await donation.populate('campaignId', 'title');

    // Update campaign current amount if applicable
    if (campaignId && donation.status === 'completed') {
      await Campaign.findByIdAndUpdate(
        campaignId,
        { $inc: { currentAmount: amount } }
      );
    }

    logger.info('Donation created:', { 
      donationId: donation._id, 
      donorId: req.user!._id,
      amount,
      campaignId
    });
    res.status(201).json(donation);
  } catch (error) {
    logger.error('Error creating donation:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/donations/:id/status - Update donation status (admin only)
router.put('/:id/status', adminRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid donation ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const oldStatus = donation.status;
    donation.status = status;
    if (transactionId) donation.transactionId = transactionId;

    await donation.save();

    // Update campaign amount if status changed to/from completed
    if (donation.campaignId) {
      if (oldStatus !== 'completed' && status === 'completed') {
        await Campaign.findByIdAndUpdate(
          donation.campaignId,
          { $inc: { currentAmount: donation.amount } }
        );
      } else if (oldStatus === 'completed' && status !== 'completed') {
        await Campaign.findByIdAndUpdate(
          donation.campaignId,
          { $inc: { currentAmount: -donation.amount } }
        );
      }
    }

    logger.info('Donation status updated:', { 
      donationId: donation._id, 
      oldStatus,
      newStatus: status,
      updatedBy: req.user!._id
    });
    res.json(donation);
  } catch (error) {
    logger.error('Error updating donation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/donations/campaigns - List campaigns
router.get('/campaigns/list', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Only show active campaigns unless user is admin
    if (req.user?.role !== 'admin') {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [campaigns, total] = await Promise.all([
      Campaign.find(query)
        .populate('createdBy', 'email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Campaign.countDocuments(query)
    ]);

    // Calculate progress for each campaign
    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      progress: campaign.goalAmount > 0 ? (campaign.currentAmount / campaign.goalAmount) * 100 : 0,
      daysRemaining: Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    }));

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      campaigns: campaignsWithProgress,
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
    logger.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/donations/campaigns/:id - Get specific campaign
router.get('/campaigns/:id', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findById(id)
      .populate('createdBy', 'email')
      .lean();

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Only show active campaigns unless user is admin
    if (req.user?.role !== 'admin' && campaign.status !== 'active') {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get donation statistics for this campaign
    const [donationCount, recentDonations] = await Promise.all([
      Donation.countDocuments({ campaignId: id, status: 'completed' }),
      Donation.find({ campaignId: id, status: 'completed' })
        .populate('donorId', 'firstName lastName')
        .sort({ donationDate: -1 })
        .limit(10)
        .lean()
    ]);

    res.json({
      ...campaign,
      progress: campaign.goalAmount > 0 ? (campaign.currentAmount / campaign.goalAmount) * 100 : 0,
      daysRemaining: Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      donationCount,
      recentDonations
    });
  } catch (error) {
    logger.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/donations/campaigns - Create campaign (admin only)
router.post('/campaigns', adminRoute, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      goalAmount,
      startDate,
      endDate,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !description || !goalAmount || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, goalAmount, startDate, endDate' 
      });
    }

    const campaign = new Campaign({
      title,
      description,
      goalAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      createdBy: req.user!._id
    });

    await campaign.save();
    await campaign.populate('createdBy', 'email');

    logger.info('Campaign created:', { 
      campaignId: campaign._id, 
      createdBy: req.user!._id 
    });
    res.status(201).json(campaign);
  } catch (error) {
    logger.error('Error creating campaign:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/donations/campaigns/:id - Update campaign (admin only)
router.put('/campaigns/:id', adminRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const {
      title,
      description,
      goalAmount,
      startDate,
      endDate,
      status
    } = req.body;

    // Update fields
    if (title !== undefined) campaign.title = title;
    if (description !== undefined) campaign.description = description;
    if (goalAmount !== undefined) campaign.goalAmount = goalAmount;
    if (startDate !== undefined) campaign.startDate = new Date(startDate);
    if (endDate !== undefined) campaign.endDate = new Date(endDate);
    if (status !== undefined) campaign.status = status;

    await campaign.save();
    await campaign.populate('createdBy', 'email');

    logger.info('Campaign updated:', { 
      campaignId: campaign._id, 
      updatedBy: req.user!._id 
    });
    res.json(campaign);
  } catch (error) {
    logger.error('Error updating campaign:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/donations/stats/overview - Get donations statistics (admin only)
router.get('/stats/overview', adminRoute, async (req: Request, res: Response) => {
  try {
    const [
      totalDonations,
      completedDonations,
      pendingDonations,
      totalAmount,
      recentDonations,
      activeCampaigns,
      monthlyStats
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'completed' }),
      Donation.countDocuments({ status: 'pending' }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Donation.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      Campaign.countDocuments({ status: 'active' }),
      Donation.aggregate([
        {
          $match: {
            status: 'completed',
            donationDate: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$donationDate' },
              month: { $month: '$donationDate' }
            },
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const totalAmountValue = totalAmount[0]?.total || 0;

    res.json({
      totalDonations,
      completedDonations,
      pendingDonations,
      totalAmount: totalAmountValue,
      recentDonations,
      activeCampaigns,
      monthlyStats
    });
  } catch (error) {
    logger.error('Error fetching donations statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;