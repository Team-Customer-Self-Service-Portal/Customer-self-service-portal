import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidation = (req: Request, res: Response, next: NextFunction): void => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: result.array() });
    return;
  }
  next();
};

export const registerValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
  body('firstName').isString().notEmpty(),
  body('lastName').isString().notEmpty(),
  handleValidation,
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty(),
  handleValidation,
];

export const createCaseValidator = [
  body('subject').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('category').isString().notEmpty(),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  handleValidation,
];

export const updateCaseValidator = [
  body('status').optional().isIn(['New', 'Open', 'Pending', 'Resolved', 'Closed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('description').optional().isString(),
  handleValidation,
];

export const createArticleValidator = [
  body('title').isString().notEmpty(),
  body('body').isString().notEmpty(),
  body('summary').isString().notEmpty(),
  body('category').isString().notEmpty(),
  handleValidation,
];

export const createPostValidator = [
  body('title').isString().notEmpty(),
  body('body').isString().notEmpty(),
  body('category').isString().notEmpty(),
  handleValidation,
];

export const createCommentValidator = [
  body('text').optional().isString().notEmpty(),
  body('body').optional().isString().notEmpty(),
  handleValidation,
];
