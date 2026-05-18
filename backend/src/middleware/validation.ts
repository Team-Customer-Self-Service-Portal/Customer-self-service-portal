import { Request, Response, NextFunction } from 'express';
import { body, param, query, ValidationChain, validationResult } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.type === 'field' ? err.path : undefined,
          message: err.msg,
        })),
      });
      return;
    }

    next();
  };
};

export const authValidation = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],

  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
};

export const caseValidation = {
  create: [
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('type').isIn(['Question', 'Problem', 'Feature Request', 'Bug Report']).withMessage('Invalid case type'),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid case ID'),
    body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('status').optional().isIn(['New', 'In Progress', 'Pending', 'Resolved', 'Closed']).withMessage('Invalid status'),
  ],

  addComment: [
    param('id').isMongoId().withMessage('Invalid case ID'),
    body('content').trim().notEmpty().withMessage('Comment content is required'),
  ],
};

export const knowledgeValidation = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('summary').trim().notEmpty().withMessage('Summary is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid article ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  ],

  search: [
    query('q').optional().trim(),
    query('category').optional().trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
};

export const communityValidation = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid post ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  ],

  addReply: [
    param('id').isMongoId().withMessage('Invalid post ID'),
    body('content').trim().notEmpty().withMessage('Reply content is required'),
  ],
};

export const userValidation = {
  updateProfile: [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    body('timezone').optional().isString().withMessage('Timezone must be a string'),
    body('language').optional().isIn(['en', 'es', 'fr', 'de', 'ja', 'zh']).withMessage('Invalid language'),
  ],

  updatePreferences: [
    body('emailNotifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
    body('smsNotifications').optional().isBoolean().withMessage('SMS notifications must be boolean'),
    body('newsletter').optional().isBoolean().withMessage('Newsletter must be boolean'),
    body('theme').optional().isIn(['light', 'dark', 'auto']).withMessage('Invalid theme'),
  ],
};
