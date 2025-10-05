import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import Case from '../../models/Case';
import User from '../../models/User';
import { salesforceService } from '../../services/salesforce/salesforceService';
import { logger } from '../../utils/logger';
import { cacheService, CacheKeys } from '../../services/cache/cacheService';

class CaseController {
  async createCase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { subject, description, type, priority } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const caseData = {
        subject,
        description,
        type,
        priority: priority || 'Medium',
        status: 'New',
        userId: user._id,
      };

      const newCase = new Case(caseData);
      await newCase.save();

      if (user.salesforceId) {
        try {
          const salesforceCase = await salesforceService.createCase({
            Subject: subject,
            Description: description,
            Status: 'New',
            Priority: priority || 'Medium',
            Origin: 'Web',
            ContactId: user.salesforceId,
            AccountId: user.accountId,
            Type: type,
          });

          newCase.salesforceId = salesforceCase.Id;
          newCase.lastSyncedAt = new Date();
          await newCase.save();

          logger.info(`Case ${newCase.caseNumber} synced with Salesforce`, {
            caseId: newCase._id,
            salesforceId: salesforceCase.Id
          });
        } catch (salesforceError) {
          logger.warn('Failed to sync case with Salesforce:', salesforceError);
        }
      }

      await cacheService.del(CacheKeys.userCases(userId!));

      res.status(201).json({
        success: true,
        message: 'Case created successfully',
        data: { case: newCase }
      });

    } catch (error) {
      logger.error('Create case error:', error);
      next(error);
    }
  }

  async getCases(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { status, priority, page = 1, limit = 10 } = req.query;

      const cacheKey = `${CacheKeys.userCases(userId!)}:${status || 'all'}:${priority || 'all'}:${page}:${limit}`;
      const cachedCases = await cacheService.get(cacheKey);

      if (cachedCases) {
        res.status(200).json({
          success: true,
          data: cachedCases
        });
        return;
      }

      const query: any = { userId };

      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority = priority;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [cases, total] = await Promise.all([
        Case.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate('userId', 'firstName lastName email'),
        Case.countDocuments(query)
      ]);

      const result = {
        cases,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      };

      await cacheService.set(cacheKey, result, 120);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Get cases error:', error);
      next(error);
    }
  }

  async getCaseById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const cacheKey = CacheKeys.case(id);
      const cachedCase = await cacheService.get(cacheKey);

      if (cachedCase) {
        res.status(200).json({
          success: true,
          data: { case: cachedCase }
        });
        return;
      }

      const caseDoc = await Case.findById(id)
        .populate('userId', 'firstName lastName email')
        .populate('comments.author', 'firstName lastName email avatar');

      if (!caseDoc) {
        res.status(404).json({
          success: false,
          message: 'Case not found'
        });
        return;
      }

      if (caseDoc.userId._id.toString() !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to access this case'
        });
        return;
      }

      await cacheService.set(cacheKey, caseDoc, 300);

      res.status(200).json({
        success: true,
        data: { case: caseDoc }
      });

    } catch (error) {
      logger.error('Get case by ID error:', error);
      next(error);
    }
  }

  async updateCase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const updates = req.body;

      const caseDoc = await Case.findById(id);

      if (!caseDoc) {
        res.status(404).json({
          success: false,
          message: 'Case not found'
        });
        return;
      }

      if (caseDoc.userId.toString() !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to update this case'
        });
        return;
      }

      Object.assign(caseDoc, updates);
      await caseDoc.save();

      if (caseDoc.salesforceId) {
        try {
          await salesforceService.updateCase(caseDoc.salesforceId, {
            Subject: caseDoc.subject,
            Description: caseDoc.description,
            Status: caseDoc.status,
            Priority: caseDoc.priority,
          });

          caseDoc.lastSyncedAt = new Date();
          await caseDoc.save();

          logger.info(`Case ${caseDoc.caseNumber} updated in Salesforce`, {
            caseId: caseDoc._id,
            salesforceId: caseDoc.salesforceId
          });
        } catch (salesforceError) {
          logger.warn('Failed to update case in Salesforce:', salesforceError);
        }
      }

      await cacheService.del(CacheKeys.case(id));
      await cacheService.delPattern(`${CacheKeys.userCases(userId!)}:*`);

      res.status(200).json({
        success: true,
        message: 'Case updated successfully',
        data: { case: caseDoc }
      });

    } catch (error) {
      logger.error('Update case error:', error);
      next(error);
    }
  }

  async deleteCase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const caseDoc = await Case.findById(id);

      if (!caseDoc) {
        res.status(404).json({
          success: false,
          message: 'Case not found'
        });
        return;
      }

      if (caseDoc.userId.toString() !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this case'
        });
        return;
      }

      await Case.findByIdAndDelete(id);

      await cacheService.del(CacheKeys.case(id));
      await cacheService.delPattern(`${CacheKeys.userCases(userId!)}:*`);

      res.status(200).json({
        success: true,
        message: 'Case deleted successfully'
      });

    } catch (error) {
      logger.error('Delete case error:', error);
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { content } = req.body;

      const caseDoc = await Case.findById(id);

      if (!caseDoc) {
        res.status(404).json({
          success: false,
          message: 'Case not found'
        });
        return;
      }

      if (caseDoc.userId.toString() !== userId && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to comment on this case'
        });
        return;
      }

      caseDoc.comments.push({
        author: userId as any,
        content,
        isInternal: false,
        createdAt: new Date()
      });

      await caseDoc.save();

      await cacheService.del(CacheKeys.case(id));

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: { case: caseDoc }
      });

    } catch (error) {
      logger.error('Add comment error:', error);
      next(error);
    }
  }
}

export const caseController = new CaseController();
