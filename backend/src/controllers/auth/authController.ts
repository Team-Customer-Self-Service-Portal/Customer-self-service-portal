import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../../models/User';
import { salesforceService } from '../../services/salesforce/salesforceService';
import { logger } from '../../utils/logger';
import { cacheService } from '../../services/cache/cacheService';
import { AuthRequest } from '../../middleware/auth';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.array().map(err => `${err.type === 'field' ? err.path : ''}: ${err.msg}`)
        });
        return;
      }

      const { firstName, lastName, email, password, phone } = req.body;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
        return;
      }

      const userData = {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        isEmailVerified: process.env.NODE_ENV === 'development',
      };

      const user = new User(userData);
      await user.save();

      try {
        const salesforceContact = await salesforceService.upsertContact({
          FirstName: firstName,
          LastName: lastName,
          Email: email.toLowerCase(),
          Phone: phone,
        });

        user.salesforceId = salesforceContact.Id;
        user.accountId = salesforceContact.AccountId;
        user.lastSyncedAt = new Date();
        await user.save();

        logger.info(`User ${email} synced with Salesforce`, {
          userId: user._id,
          salesforceId: salesforceContact.Id
        });
      } catch (salesforceError) {
        logger.warn('Failed to sync new user with Salesforce:', salesforceError);
      }

      const tokens = this.generateTokens(user._id.toString(), false);

      const refreshTokenKey = `refresh_token:${user._id}`;
      await cacheService.set(refreshTokenKey, tokens.refreshToken, 7 * 24 * 60 * 60);

      logger.info(`New user registered: ${email}`, {
        userId: user._id,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          tokens: user.isEmailVerified ? {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
          } : undefined
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.array().map(err => `${err.type === 'field' ? err.path : ''}: ${err.msg}`)
        });
        return;
      }

      const { email, password, rememberMe = false } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password +loginAttempts +lockUntil');

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      if (user.isLocked) {
        res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
        });
        return;
      }

      if (!user.isEmailVerified) {
        res.status(403).json({
          success: false,
          message: 'Please verify your email address before logging in'
        });
        return;
      }

      if (user.status !== 'active') {
        res.status(403).json({
          success: false,
          message: 'Your account is inactive. Please contact support.'
        });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      const updateData: any = {
        $unset: { loginAttempts: 1, lockUntil: 1 },
        lastLoginAt: new Date()
      };

      await User.findByIdAndUpdate(user._id, updateData);

      const tokens = this.generateTokens(user._id.toString(), rememberMe);

      const refreshTokenKey = `refresh_token:${user._id}`;
      await cacheService.set(refreshTokenKey, tokens.refreshToken, rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60);

      logger.info(`User ${user.email} logged in successfully`, {
        userId: user._id,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            preferences: user.preferences
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
          }
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (userId) {
        await cacheService.del(`refresh_token:${userId}`);
        
        logger.info(`User logged out`, {
          userId,
          ip: req.ip
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            preferences: user.preferences,
            isEmailVerified: user.isEmailVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      logger.error('Get current user error:', error);
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      const userId = decoded.userId;

      const cachedToken = await cacheService.get(`refresh_token:${userId}`);
      if (!cachedToken || cachedToken !== refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user || user.status !== 'active') {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      const tokens = this.generateTokens(userId, true);

      await cacheService.set(`refresh_token:${userId}`, tokens.refreshToken, 30 * 24 * 60 * 60);

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      });

    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.array().map(err => `${err.type === 'field' ? err.path : ''}: ${err.msg}`)
        });
        return;
      }

      const { email } = req.body;

      const user = await User.findOne({ 
        email: email.toLowerCase(),
        status: 'active'
      });

      if (!user) {
        res.status(200).json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        });
        return;
      }

      const resetToken = user.generatePasswordResetToken();
      await user.save();

      logger.info(`Password reset requested for user ${user.email}`, {
        userId: user._id,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });

    } catch (error) {
      logger.error('Forgot password error:', error);
      next(error);
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: errors.array().map(err => `${err.type === 'field' ? err.path : ''}: ${err.msg}`)
        });
        return;
      }

      const { token, password } = req.body;

      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
        status: 'active'
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token'
        });
        return;
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      logger.info(`Password reset successful for user ${user.email}`, {
        userId: user._id,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });

    } catch (error) {
      logger.error('Reset password error:', error);
      next(error);
    }
  }

private generateTokens(userId: string, rememberMe: boolean): AuthTokens {
  const accessTokenExpiry = '15m';
  const refreshTokenExpiry = rememberMe ? '30d' : '7d';

  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET as string,
    { expiresIn: accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: refreshTokenExpiry }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenExpiry
  };
}
}

export const authController = new AuthController();
