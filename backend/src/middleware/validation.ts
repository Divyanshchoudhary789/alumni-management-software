import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../config/logger';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    logger.warn('Validation errors:', { 
      path: req.path, 
      method: req.method, 
      errors: errorMessages 
    });

    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errorMessages
      }
    });
    return;
  }

  next();
};

/**
 * Alumni profile validation rules
 */
export const validateAlumniProfile = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('graduationYear')
    .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
    .withMessage('Graduation year must be a valid year'),
  
  body('degree')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Degree must be between 1 and 100 characters'),
  
  body('currentCompany')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Current company must be less than 100 characters'),
  
  body('currentPosition')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Current position must be less than 100 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  
  body('linkedinUrl')
    .optional()
    .isURL()
    .matches(/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)
    .withMessage('Invalid LinkedIn URL format'),
  
  body('websiteUrl')
    .optional()
    .isURL()
    .withMessage('Invalid website URL format'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each skill must be less than 50 characters'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('interests.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each interest must be less than 50 characters'),
  
  handleValidationErrors
];

/**
 * Event validation rules
 */
export const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  
  body('eventDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  
  body('capacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10000'),
  
  body('registrationDeadline')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      const eventDate = new Date(req.body.eventDate);
      if (new Date(value) >= eventDate) {
        throw new Error('Registration deadline must be before event date');
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Status must be one of: draft, published, cancelled, completed'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  handleValidationErrors
];

/**
 * Communication validation rules
 */
export const validateCommunication = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  
  body('type')
    .isIn(['newsletter', 'announcement', 'event_invitation', 'donation_request', 'general'])
    .withMessage('Type must be one of: newsletter, announcement, event_invitation, donation_request, general'),
  
  body('targetAudience')
    .optional()
    .isArray()
    .withMessage('Target audience must be an array'),
  
  body('targetAudience.*')
    .optional()
    .isIn(['all', 'alumni', 'recent_graduates', 'donors', 'mentors', 'mentees', 'event_attendees'])
    .withMessage('Invalid target audience value'),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Donation validation rules
 */
export const validateDonation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0.01'),
  
  body('purpose')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Purpose must be between 1 and 200 characters'),
  
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe'])
    .withMessage('Payment method must be one of: credit_card, debit_card, bank_transfer, paypal, stripe'),
  
  body('campaignId')
    .optional()
    .isMongoId()
    .withMessage('Campaign ID must be a valid MongoDB ObjectId'),
  
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must be less than 100 characters'),
  
  handleValidationErrors
];

/**
 * Campaign validation rules
 */
export const validateCampaign = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  
  body('goalAmount')
    .isFloat({ min: 1 })
    .withMessage('Goal amount must be a positive number greater than 1'),
  
  body('startDate')
    .isISO8601()
    .toDate(),
  
  body('endDate')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      if (new Date(value) <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'completed', 'cancelled'])
    .withMessage('Status must be one of: draft, active, completed, cancelled'),
  
  handleValidationErrors
];

/**
 * Mentorship validation rules
 */
export const validateMentorProfile = [
  body('yearsOfExperience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  
  body('maxMentees')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Max mentees must be between 1 and 20'),
  
  body('bio')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Bio must be between 1 and 1000 characters'),
  
  body('expertise')
    .optional()
    .isArray()
    .withMessage('Expertise must be an array'),
  
  body('expertise.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each expertise must be less than 50 characters'),
  
  body('industries')
    .optional()
    .isArray()
    .withMessage('Industries must be an array'),
  
  body('industries.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each industry must be less than 50 characters'),
  
  body('availableHours')
    .optional()
    .isArray()
    .withMessage('Available hours must be an array'),
  
  body('availableHours.*')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'weekend'])
    .withMessage('Invalid available hours value'),
  
  body('preferredCommunication')
    .optional()
    .isArray()
    .withMessage('Preferred communication must be an array'),
  
  body('preferredCommunication.*')
    .optional()
    .isIn(['email', 'video_call', 'phone', 'in_person', 'messaging'])
    .withMessage('Invalid preferred communication value'),
  
  handleValidationErrors
];

export const validateMenteeProfile = [
  body('careerStage')
    .isIn(['student', 'recent_graduate', 'early_career', 'mid_career', 'career_change'])
    .withMessage('Career stage must be one of: student, recent_graduate, early_career, mid_career, career_change'),
  
  body('bio')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Bio must be between 1 and 1000 characters'),
  
  body('goals')
    .optional()
    .isArray()
    .withMessage('Goals must be an array'),
  
  body('goals.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each goal must be less than 100 characters'),
  
  body('interestedIndustries')
    .optional()
    .isArray()
    .withMessage('Interested industries must be an array'),
  
  body('interestedIndustries.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each interested industry must be less than 50 characters'),
  
  body('preferredCommunication')
    .optional()
    .isArray()
    .withMessage('Preferred communication must be an array'),
  
  body('preferredCommunication.*')
    .optional()
    .isIn(['email', 'video_call', 'phone', 'in_person', 'messaging'])
    .withMessage('Invalid preferred communication value'),
  
  handleValidationErrors
];

/**
 * Common parameter validations
 */
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

/**
 * Search and filter validations
 */
export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  handleValidationErrors
];