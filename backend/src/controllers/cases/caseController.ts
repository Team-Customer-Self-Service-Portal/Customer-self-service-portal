import { NextFunction, Response } from 'express';
import { Case, User } from '../../models';
import { emailService } from '../../services/email';
import { salesforceService } from '../../services/salesforce';
import { AuthenticatedRequest } from '../../types';
import { generateCaseNumber, paginate } from '../../utils/helpers';

const isPrivileged = (role: string | undefined): boolean => role === 'admin' || role === 'agent';

export const listCases = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { isDeleted: false };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (!isPrivileged(req.user?.role)) {
      filter.userId = req.user?.userId;
    }

    const result = await paginate(Case.find(filter).sort({ createdAt: -1 }), Number(page), Number(limit));
    res.json({
      success: true,
      data: result.data,
      pagination: { total: result.total, page: result.page, pages: result.pages, limit: Number(limit) || 20 },
    });
  } catch (error) {
    next(error);
  }
};

export const createCase = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newCase = await Case.create({
      caseNumber: generateCaseNumber(),
      subject: req.body.subject,
      description: req.body.description,
      priority: req.body.priority,
      category: req.body.category,
      userId: req.user?.userId,
    });

    salesforceService
      .createCase({ Subject: newCase.subject, Description: newCase.description, Priority: newCase.priority, Type: newCase.category })
      .then(async (salesforceCaseId: string) => {
        newCase.salesforceCaseId = salesforceCaseId;
        await newCase.save();
      })
      .catch(() => undefined);

    const user = await User.findById(req.user?.userId);
    if (user) {
      emailService.sendCaseCreatedEmail(user, { caseNumber: newCase.caseNumber, subject: newCase.subject }).catch(() => undefined);
    }

    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    next(error);
  }
};

export const getCaseById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Case.findById(req.params.id).populate('userId', 'firstName lastName email role');
    if (!item || item.isDeleted) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }
    if (!isPrivileged(req.user?.role) && String(item.userId) !== req.user?.userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateCase = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Case.findById(req.params.id);
    if (!item || item.isDeleted) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }
    if (!isPrivileged(req.user?.role) && String(item.userId) !== req.user?.userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const previousStatus = item.status;
    if (req.body.status) item.status = req.body.status;
    if (req.body.priority) item.priority = req.body.priority;
    if (req.body.description) item.description = req.body.description;
    await item.save();

    if (item.salesforceCaseId) {
      salesforceService.updateCase(item.salesforceCaseId, { Status: item.status, Priority: item.priority, Description: item.description }).catch(() => undefined);
    }

    if (String(previousStatus) !== String(item.status)) {
      const owner = await User.findById(item.userId);
      if (owner) {
        emailService.sendCaseUpdatedEmail(owner, { caseNumber: item.caseNumber, subject: item.subject, status: item.status }, `Status changed from ${previousStatus} to ${item.status}`).catch(() => undefined);
      }
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteCase = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Case.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }
    item.isDeleted = true;
    await item.save();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Case.findById(req.params.id);
    if (!item || item.isDeleted) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    item.comments.push({ text: req.body.text, authorId: req.user?.userId as never, createdAt: new Date() });
    await item.save();

    if (req.user?.role === 'agent' || req.user?.role === 'admin') {
      const owner = await User.findById(item.userId);
      if (owner) {
        emailService.sendCaseUpdatedEmail(owner, { caseNumber: item.caseNumber, subject: item.subject, status: item.status }, 'A new comment was added to your case').catch(() => undefined);
      }
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};
