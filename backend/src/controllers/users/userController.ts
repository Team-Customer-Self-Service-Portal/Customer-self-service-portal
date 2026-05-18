import { NextFunction, Response } from 'express';
import { User } from '../../models';
import { cacheService } from '../../services/cache';
import { AuthenticatedRequest } from '../../types';
import { paginate, sanitizeUser } from '../../utils/helpers';

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.user?.userId, { firstName: req.body.firstName, lastName: req.body.lastName }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    await cacheService.del(`user:${req.user?.userId}`);
    res.json({ success: true, data: sanitizeUser(user.toObject()) });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const result = await paginate(User.find({}).sort({ createdAt: -1 }), Number(page), Number(limit));
    res.json({
      success: true,
      data: result.data.map((u) => sanitizeUser(u.toObject())),
      pagination: { total: result.total, page: result.page, pages: result.pages, limit: Number(limit) || 20 },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body as { role: 'customer' | 'admin' | 'agent' };
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: sanitizeUser(user.toObject()) });
  } catch (error) {
    next(error);
  }
};
