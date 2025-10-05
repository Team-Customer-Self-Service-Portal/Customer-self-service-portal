import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import User from '../../models/User';
import { logger } from '../../utils/logger';
import { cacheService, CacheKeys } from '../../services/cache/cacheService';

class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      const cacheKey = CacheKeys.user(userId!);
      const cachedUser = await cacheService.get(cacheKey);

      if (cachedUser) {
        res.status(200).json({
          success: true,
          data: { user: cachedUser }
        });
        return;
      }

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      await cacheService.set(cacheKey, user, 600);

      res.status(200).json({
        success: true,
        data: { user }
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { firstName, lastName, phone, timezone, language } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (timezone) user.timezone = timezone;
      if (language) user.language = language;

      await user.save();

      await cacheService.del(CacheKeys.user(userId!));

      logger.info(`User ${user.email} updated profile`, {
        userId: user._id
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { emailNotifications, smsNotifications, newsletter, theme } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
      if (smsNotifications !== undefined) user.preferences.smsNotifications = smsNotifications;
      if (newsletter !== undefined) user.preferences.newsletter = newsletter;
      if (theme) user.preferences.theme = theme;

      await user.save();

      await cacheService.del(CacheKeys.user(userId!));

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: { preferences: user.preferences }
      });

    } catch (error) {
      logger.error('Update preferences error:', error);
      next(error);
    }
  }

  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      res.status(501).json({
        success: false,
        message: 'Avatar upload not yet implemented'
      });

    } catch (error) {
      logger.error('Upload avatar error:', error);
      next(error);
    }
  }
}

export const userController = new UserController();
