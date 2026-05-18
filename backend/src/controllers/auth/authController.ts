import crypto from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import redisClient from '../../config/redis';
import { User } from '../../models';
import { emailService } from '../../services/email';
import { AuthenticatedRequest } from '../../types';
import { JWT_EXPIRE, JWT_SECRET } from '../../utils/constants';
import { sanitizeUser } from '../../utils/helpers';

const signToken = (userId: string, role: string): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRE as SignOptions['expiresIn'] };
  return jwt.sign({ userId, role }, JWT_SECRET, options);
};

const parseTokenExpiryToSeconds = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 24 * 60 * 60;
  }
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === 's') return value;
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 3600;
  return value * 86400;
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body as { email: string; password: string; firstName: string; lastName: string };
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }

    const user = await User.create({ email, password, firstName, lastName });
    const token = signToken(String(user._id), user.role);

    emailService.sendWelcomeEmail(user).catch(() => undefined);

    res.status(201).json({ success: true, data: { token, user: sanitizeUser(user.toObject()) } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = signToken(String(user._id), user.role);
    try {
      await redisClient.set(`session:${String(user._id)}`, JSON.stringify({ token, loginAt: Date.now() }), 'EX', parseTokenExpiryToSeconds(JWT_EXPIRE));
    } catch {
      // do nothing
    }

    res.json({ success: true, data: { token, user: sanitizeUser(user.toObject()) } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (token) {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      const ttl = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1) : 3600;
      try {
        await redisClient.set(`blacklist:${token}`, '1', 'EX', ttl);
      } catch {
        // do nothing
      }
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: sanitizeUser(user.toObject()) });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.json({ success: true, data: {} });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    try {
      await redisClient.set(`pwdreset:${String(user._id)}`, tokenHash, 'EX', 15 * 60);
    } catch {
      // continue
    }

    emailService.sendPasswordResetEmail(user, resetToken).catch(() => undefined);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, token, password } = req.body as { userId: string; token: string; password: string };
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const saved = await redisClient.get(`pwdreset:${userId}`);
    if (!saved || saved !== tokenHash) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.password = password;
    await user.save();
    await redisClient.del(`pwdreset:${userId}`);

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
