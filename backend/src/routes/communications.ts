import express, { Request, Response } from 'express';
import { Communication, CommunicationTemplate } from '../models/Communication';
import { AlumniProfile } from '../models/AlumniProfile';
import { adminRoute } from '../middleware/auth';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/communications - List communications (admin only)
router.get('/', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Number(page) > 0 ? parseInt(page as string) : 1;
    const limitNum = Number(limit) > 0 ? parseInt(limit as string) : 20;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }
    // Filters
    if (type) query.type = type;
    if (status) query.status = status;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const [communications, total] = await Promise.all([
      Communication.find(query)
        .populate('createdBy', 'email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Communication.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      communications,
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
    logger.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/communications/:id - Get specific communication (admin only)
router.get('/:id', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid communication ID' });
    }

    const communication = await Communication.findById(id)
      .populate('createdBy', 'email')
      .populate('recipients', 'firstName lastName email')
      .lean();

    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.json(communication);
  } catch (error) {
    logger.error('Error fetching communication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/communications - Create communication (admin only)
router.post('/', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      content,
      type,
      targetAudience = ['all'],
      scheduledDate,
      recipients = []
    } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({
        error: 'Missing required fields: title, content, type'
      });
    }

    let finalRecipients = recipients;
    if (targetAudience.includes('all') || targetAudience.length === 0) {
      const allAlumni = await AlumniProfile.find({ isPublic: true }).select('_id');
      finalRecipients = allAlumni.map(alumni => alumni._id);
    } else {
      const audienceQuery: any = { isPublic: true };
      if (targetAudience.includes('recent_graduates')) {
        const currentYear = new Date().getFullYear();
        audienceQuery.graduationYear = { $gte: currentYear - 2 };
      }
      const targetedAlumni = await AlumniProfile.find(audienceQuery).select('_id');
      finalRecipients = targetedAlumni.map(alumni => alumni._id);
    }

    const communication = new Communication({
      title,
      content,
      type,
      targetAudience,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      recipients: finalRecipients,
      createdBy: req.user!._id,
      status: scheduledDate ? 'scheduled' : 'draft'
    });

    await communication.save();
    await communication.populate('createdBy', 'email');

    logger.info('Communication created:', {
      communicationId: communication._id,
      createdBy: req.user!._id,
      recipientCount: finalRecipients.length
    });
    res.status(201).json(communication);
  } catch (error) {
    logger.error('Error creating communication:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/communications/:id - Update communication (admin only)
router.put('/:id', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid communication ID' });
    }

    const communication = await Communication.findById(id);
    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    if (communication.status === 'sent') {
      return res.status(400).json({ error: 'Cannot edit sent communications' });
    }

    const updatableFields = [
      'title', 'content', 'type', 'targetAudience', 'scheduledDate', 'status'
    ];
    for (const key of updatableFields) {
      if (req.body[key] !== undefined) {
        // For scheduledDate, handle conversion
        if (key === 'scheduledDate') {
          communication.scheduledDate = req.body[key] ? new Date(req.body[key]) : undefined;
        } else {
          (communication as any)[key] = req.body[key];
        }
      }
    }

    await communication.save();
    await communication.populate('createdBy', 'email');

    logger.info('Communication updated:', {
      communicationId: communication._id,
      updatedBy: req.user!._id
    });
    res.json(communication);
  } catch (error) {
    logger.error('Error updating communication:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/communications/:id - Delete communication (admin only)
router.delete('/:id', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid communication ID' });
    }

    const communication = await Communication.findById(id);
    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    if (communication.status === 'sent') {
      return res.status(400).json({ error: 'Cannot delete sent communications' });
    }

    await Communication.findByIdAndDelete(id);

    logger.info('Communication deleted:', {
      communicationId: id,
      deletedBy: req.user!._id
    });
    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    logger.error('Error deleting communication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/communications/:id/send - Send communication (admin only)
router.post('/:id/send', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid communication ID' });
    }

    const communication = await Communication.findById(id);
    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    if (communication.status === 'sent') {
      return res.status(400).json({ error: 'Communication already sent' });
    }

    // TODO: Implement actual delivery logic
    communication.status = 'sent';
    communication.sentDate = new Date();
    communication.deliveryStats.sent = communication.recipients.length;
    communication.deliveryStats.delivered = communication.recipients.length; // Mock delivery

    await communication.save();

    logger.info('Communication sent:', {
      communicationId: communication._id,
      sentBy: req.user!._id,
      recipientCount: communication.recipients.length
    });
    res.json(communication);
  } catch (error) {
    logger.error('Error sending communication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/communications/templates/list - List communication templates (admin only)
router.get('/templates/list', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, isActive = 'true' } = req.query;

    const query: any = {};
    if (type) query.type = type;
    if (isActive !== 'all') query.isActive = isActive === 'true';

    const templates = await CommunicationTemplate.find(query)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    logger.error('Error fetching communication templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/communications/templates - Create communication template (admin only)
router.post('/templates', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      subject,
      content,
      type,
      variables = []
    } = req.body;

    if (!name || !subject || !content || !type) {
      return res.status(400).json({
        error: 'Missing required fields: name, subject, content, type'
      });
    }

    const template = new CommunicationTemplate({
      name,
      subject,
      content,
      type,
      variables,
      createdBy: req.user!._id
    });

    await template.save();
    await template.populate('createdBy', 'email');

    logger.info('Communication template created:', {
      templateId: template._id,
      createdBy: req.user!._id
    });
    res.status(201).json(template);
  } catch (error) {
    logger.error('Error creating communication template:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/communications/stats/overview - Get communications statistics (admin only)
router.get('/stats/overview', adminRoute, async (req: Request, res: Response): Promise<any> => {
  try {
    const [
      totalCommunications,
      sentCommunications,
      scheduledCommunications,
      draftCommunications,
      recentCommunications,
      deliveryStats
    ] = await Promise.all([
      Communication.countDocuments(),
      Communication.countDocuments({ status: 'sent' }),
      Communication.countDocuments({ status: 'scheduled' }),
      Communication.countDocuments({ status: 'draft' }),
      Communication.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Communication.aggregate([
        { $match: { status: 'sent' } },
        {
          $group: {
            _id: null,
            totalSent: { $sum: '$deliveryStats.sent' },
            totalDelivered: { $sum: '$deliveryStats.delivered' },
            totalOpened: { $sum: '$deliveryStats.opened' },
            totalClicked: { $sum: '$deliveryStats.clicked' },
            totalFailed: { $sum: '$deliveryStats.failed' }
          }
        }
      ])
    ]);

    const stats = deliveryStats[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalFailed: 0
    };

    res.json({
      totalCommunications,
      sentCommunications,
      scheduledCommunications,
      draftCommunications,
      recentCommunications,
      deliveryStats: stats
    });
  } catch (error) {
    logger.error('Error fetching communications statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
