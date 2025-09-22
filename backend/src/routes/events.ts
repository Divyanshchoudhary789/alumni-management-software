import express, { Request, Response } from 'express';
import { Event, EventRegistration, IEvent, IEventRegistration } from '../models/Event';
import { AlumniProfile } from '../models/AlumniProfile';
import { authenticatedRoute, adminRoute, requireAlumni } from '../middleware/auth';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/events - List events with filters
router.get('/', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      upcoming = 'false',
      past = 'false',
      sortBy = 'eventDate',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Only show published events unless user is admin
    if (req.user?.role !== 'admin') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }

    // Date filters
    const now = new Date();
    if (upcoming === 'true') {
      query.eventDate = { $gte: now };
    } else if (past === 'true') {
      query.eventDate = { $lt: now };
    }

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('createdBy', 'email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Event.countDocuments(query)
    ]);

    // Get registration counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await EventRegistration.countDocuments({
          eventId: event._id,
          status: { $in: ['registered', 'attended'] }
        });
        return {
          ...event,
          registrationCount,
          spotsRemaining: event.capacity - registrationCount
        };
      })
    );

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      events: eventsWithCounts,
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
    logger.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/:id - Get specific event
router.get('/:id', authenticatedRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(id)
      .populate('createdBy', 'email')
      .lean();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only show published events unless user is admin
    if (req.user?.role !== 'admin' && event.status !== 'published') {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get registration count and user's registration status
    const [registrationCount, userRegistration] = await Promise.all([
      EventRegistration.countDocuments({
        eventId: id,
        status: { $in: ['registered', 'attended'] }
      }),
      req.user ? EventRegistration.findOne({
        eventId: id,
        alumniId: req.user._id,
        status: { $in: ['registered', 'attended'] }
      }) : null
    ]);

    res.json({
      ...event,
      registrationCount,
      spotsRemaining: event.capacity - registrationCount,
      isRegistered: !!userRegistration,
      userRegistration
    });
  } catch (error) {
    logger.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events - Create event (admin only)
router.post('/', adminRoute, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      eventDate,
      location,
      capacity,
      registrationDeadline,
      status = 'draft',
      imageUrl
    } = req.body;

    // Validate required fields
    if (!title || !description || !eventDate || !location || !capacity || !registrationDeadline) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, eventDate, location, capacity, registrationDeadline' 
      });
    }

    const event = new Event({
      title,
      description,
      eventDate: new Date(eventDate),
      location,
      capacity,
      registrationDeadline: new Date(registrationDeadline),
      status,
      imageUrl,
      createdBy: req.user!._id
    });

    await event.save();
    await event.populate('createdBy', 'email');

    logger.info('Event created:', { eventId: event._id, createdBy: req.user!._id });
    res.status(201).json(event);
  } catch (error) {
    logger.error('Error creating event:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', adminRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const {
      title,
      description,
      eventDate,
      location,
      capacity,
      registrationDeadline,
      status,
      imageUrl
    } = req.body;

    // Update fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (eventDate !== undefined) event.eventDate = new Date(eventDate);
    if (location !== undefined) event.location = location;
    if (capacity !== undefined) event.capacity = capacity;
    if (registrationDeadline !== undefined) event.registrationDeadline = new Date(registrationDeadline);
    if (status !== undefined) event.status = status;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;

    await event.save();
    await event.populate('createdBy', 'email');

    logger.info('Event updated:', { eventId: event._id, updatedBy: req.user!._id });
    res.json(event);
  } catch (error) {
    logger.error('Error updating event:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', adminRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Also delete all registrations for this event
    await EventRegistration.deleteMany({ eventId: id });

    logger.info('Event deleted:', { eventId: id, deletedBy: req.user!._id });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ error: 'Event is not available for registration' });
    }

    // Check if registration deadline has passed
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if event is full
    const registrationCount = await EventRegistration.countDocuments({
      eventId: id,
      status: { $in: ['registered', 'attended'] }
    });

    if (registrationCount >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({
      eventId: id,
      alumniId: req.user!._id
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'cancelled') {
        // Reactivate cancelled registration
        existingRegistration.status = 'registered';
        existingRegistration.registrationDate = new Date();
        await existingRegistration.save();
        
        logger.info('Event registration reactivated:', { 
          eventId: id, 
          alumniId: req.user!._id 
        });
        res.json(existingRegistration);
      } else {
        return res.status(409).json({ error: 'Already registered for this event' });
      }
    } else {
      // Create new registration
      const registration = new EventRegistration({
        eventId: id,
        alumniId: req.user!._id,
        status: 'registered'
      });

      await registration.save();
      
      logger.info('Event registration created:', { 
        eventId: id, 
        alumniId: req.user!._id 
      });
      res.status(201).json(registration);
    }
  } catch (error) {
    logger.error('Error registering for event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/events/:id/register - Cancel event registration
router.delete('/:id/register', authenticatedRoute, requireAlumni, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const registration = await EventRegistration.findOne({
      eventId: id,
      alumniId: req.user!._id,
      status: { $in: ['registered', 'attended'] }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.status = 'cancelled';
    await registration.save();

    logger.info('Event registration cancelled:', { 
      eventId: id, 
      alumniId: req.user!._id 
    });
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling event registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/:id/attendees - Get event attendees (admin only)
router.get('/:id/attendees', adminRoute, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status = 'registered' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const registrations = await EventRegistration.find({
      eventId: id,
      status: status === 'all' ? { $ne: 'cancelled' } : status
    })
    .populate({
      path: 'alumniId',
      select: 'firstName lastName email graduationYear currentCompany'
    })
    .sort({ registrationDate: -1 });

    res.json(registrations);
  } catch (error) {
    logger.error('Error fetching event attendees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/stats/overview - Get events statistics (admin only)
router.get('/stats/overview', adminRoute, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const [
      totalEvents,
      publishedEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      recentEvents
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      Event.countDocuments({ status: 'published', eventDate: { $gte: now } }),
      Event.countDocuments({ status: 'published', eventDate: { $lt: now } }),
      EventRegistration.countDocuments({ status: { $in: ['registered', 'attended'] } }),
      Event.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    res.json({
      totalEvents,
      publishedEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      recentEvents
    });
  } catch (error) {
    logger.error('Error fetching events statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;