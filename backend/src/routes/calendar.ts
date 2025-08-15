import express from 'express';
import { body, validationResult, query } from 'express-validator';
import CalendarEvent from '../models/CalendarEvent';

const router = express.Router();

// @route   POST /api/calendar/events
// @desc    Create a new calendar event
// @access  Private
router.post('/events', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('startDate').isISO8601().withMessage('Start date is required'),
  body('endDate').isISO8601().withMessage('End date is required'),
  body('type').optional().isIn(['meeting', 'task', 'reminder', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('isAllDay').optional().isBoolean()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const eventData = {
      ...req.body,
      userId: req.user._id,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate)
    };

    const event = new CalendarEvent(eventData);
    await event.save();

    // Emit real-time update for Pro users
    if (req.app.get('io') && req.user.plan === 'pro') {
      req.app.get('io').to(`user-${req.user._id}`).emit('event-added', event);
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating event'
    });
  }
});

// @route   GET /api/calendar/events
// @desc    Get calendar events for user with filters
// @access  Private
router.get('/events', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().trim(),
  query('priority').optional().trim()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Build filter object
    const filter: any = { userId: req.user._id };
    
    if (req.query.startDate || req.query.endDate) {
      filter.startDate = {};
      if (req.query.startDate) filter.startDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.startDate.$lte = new Date(req.query.endDate);
    }
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.priority) filter.priority = req.query.priority;

    const events = await CalendarEvent.find(filter)
      .sort({ startDate: 1 })
      .lean();

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching events'
    });
  }
});

// @route   GET /api/calendar/events/:id
// @desc    Get a specific calendar event
// @access  Private
router.get('/events/:id', async (req: any, res: any) => {
  try {
    const event = await CalendarEvent.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    console.error('Get calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event'
    });
  }
});

// @route   PUT /api/calendar/events/:id
// @desc    Update a calendar event
// @access  Private
router.put('/events/:id', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('type').optional().isIn(['meeting', 'task', 'reminder', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) })
      },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Emit real-time update for Pro users
    if (req.app.get('io') && req.user.plan === 'pro') {
      req.app.get('io').to(`user-${req.user._id}`).emit('event-updated', event);
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating event'
    });
  }
});

// @route   DELETE /api/calendar/events/:id
// @desc    Delete a calendar event
// @access  Private
router.delete('/events/:id', async (req: any, res: any) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Emit real-time update for Pro users
    if (req.app.get('io') && req.user.plan === 'pro') {
      req.app.get('io').to(`user-${req.user._id}`).emit('event-deleted', req.params.id);
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
});

// @route   GET /api/calendar/upcoming
// @desc    Get upcoming events for user
// @access  Private
router.get('/upcoming', async (req: any, res: any) => {
  try {
    const now = new Date();
    const upcomingEvents = await CalendarEvent.find({
      userId: req.user._id,
      startDate: { $gte: now }
    })
    .sort({ startDate: 1 })
    .limit(10)
    .lean();

    res.json({
      success: true,
      data: { events: upcomingEvents }
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching upcoming events'
    });
  }
});

// @route   GET /api/calendar/today
// @desc    Get today's events for user
// @access  Private
router.get('/today', async (req: any, res: any) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayEvents = await CalendarEvent.find({
      userId: req.user._id,
      startDate: { $gte: startOfDay, $lt: endOfDay }
    })
    .sort({ startDate: 1 })
    .lean();

    res.json({
      success: true,
      data: { events: todayEvents }
    });
  } catch (error) {
    console.error('Get today events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching today events'
    });
  }
});

export default router;