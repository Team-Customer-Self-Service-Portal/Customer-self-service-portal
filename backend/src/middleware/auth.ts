import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { JWT_SECRET } from '../utils/constants';

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }
  next();
};

export const requireAgent = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'agent' && req.user.role !== 'admin')) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }
  next();
};
