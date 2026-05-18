import { NextFunction, Response } from 'express';
import redisClient from '../../config/redis';
import { KnowledgeArticle } from '../../models';
import { cacheService, CACHE_TTL } from '../../services/cache';
import { salesforceService } from '../../services/salesforce';
import { AuthenticatedRequest } from '../../types';

export const listKnowledge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q = '', category = '', tags = '' } = req.query as Record<string, string>;
    const cacheKey = `knowledge:list:${q}:${category}:${tags}`;
    const cached = await cacheService.get<unknown[]>(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached, pagination: { total: cached.length, page: 1, pages: 1, limit: cached.length || 20 } });
      return;
    }

    const filter: Record<string, unknown> = { isPublished: true };
    if (q) {
      filter.$text = { $search: q };
    }
    if (category) {
      filter.category = category;
    }
    if (tags) {
      filter.tags = { $in: tags.split(',').map((t) => t.trim()) };
    }

    const data = await KnowledgeArticle.find(filter).sort({ createdAt: -1 });
    await cacheService.set(cacheKey, data, CACHE_TTL.KNOWLEDGE_ARTICLES);

    res.json({ success: true, data, pagination: { total: data.length, page: 1, pages: 1, limit: data.length || 20 } });
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cacheKey = `knowledge:item:${req.params.id}`;
    const cached = await cacheService.get<unknown>(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true });
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    await cacheService.set(cacheKey, article, CACHE_TTL.KNOWLEDGE_ARTICLES);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const voteHelpful = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { vote } = req.body as { vote: 'helpful' | 'notHelpful' };
    const userId = req.user?.userId;
    const key = `knowledge:votes:${req.params.id}`;
    const member = userId ? `${userId}:${vote}` : '';
    if (!userId || !member) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const alreadyVoted = await redisClient.sismember(key, member);
    if (alreadyVoted) {
      res.json({ success: true, data: {} });
      return;
    }

    await redisClient.sadd(key, member);
    const field = vote === 'helpful' ? 'helpful' : 'notHelpful';
    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, { $inc: { [field]: 1 } }, { new: true });
    await cacheService.del(`knowledge:item:${req.params.id}`);

    res.json({ success: true, data: article || {} });
  } catch (error) {
    next(error);
  }
};

export const createKnowledge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const article = await KnowledgeArticle.create(req.body);
    try {
      await salesforceService.getKnowledgeArticles(article.title, article.category);
    } catch {
      // graceful degradation
    }
    await cacheService.delByPattern('knowledge:list:*');
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const updateKnowledge = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }
    await cacheService.del(`knowledge:item:${req.params.id}`);
    await cacheService.delByPattern('knowledge:list:*');
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};
