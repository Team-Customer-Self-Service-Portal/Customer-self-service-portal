import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import KnowledgeArticle from '../../models/KnowledgeArticle';
import { salesforceService } from '../../services/salesforce/salesforceService';
import { logger } from '../../utils/logger';
import { cacheService, CacheKeys } from '../../services/cache/cacheService';

class KnowledgeController {
  async getArticles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, category, page = 1, limit = 10 } = req.query;

      const cacheKey = CacheKeys.knowledgeList(category as string, Number(page));
      const cachedArticles = await cacheService.get(cacheKey);

      if (cachedArticles) {
        res.status(200).json({
          success: true,
          data: cachedArticles
        });
        return;
      }

      const query: any = { isPublished: true };

      if (category) {
        query.category = category;
      }

      if (q) {
        query.$text = { $search: q as string };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [articles, total] = await Promise.all([
        KnowledgeArticle.find(query)
          .sort({ viewCount: -1, createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate('author', 'firstName lastName email')
          .select('-content'),
        KnowledgeArticle.countDocuments(query)
      ]);

      const result = {
        articles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      };

      await cacheService.set(cacheKey, result, 600);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Get articles error:', error);
      next(error);
    }
  }

  async getArticleById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const cacheKey = CacheKeys.knowledgeArticle(id);
      const cachedArticle = await cacheService.get(cacheKey);

      if (cachedArticle) {
        res.status(200).json({
          success: true,
          data: { article: cachedArticle }
        });
        return;
      }

      const article = await KnowledgeArticle.findById(id)
        .populate('author', 'firstName lastName email')
        .populate('relatedArticles', 'title summary category');

      if (!article) {
        res.status(404).json({
          success: false,
          message: 'Article not found'
        });
        return;
      }

      if (!article.isPublished && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Article is not published'
        });
        return;
      }

      await article.incrementViewCount();

      await cacheService.set(cacheKey, article, 600);

      res.status(200).json({
        success: true,
        data: { article }
      });

    } catch (error) {
      logger.error('Get article by ID error:', error);
      next(error);
    }
  }

  async createArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, content, summary, category, tags, isPublished } = req.body;

      if (req.user?.role !== 'admin' && req.user?.role !== 'support') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to create articles'
        });
        return;
      }

      const articleData = {
        title,
        content,
        summary,
        category,
        tags: tags || [],
        author: userId,
        isPublished: isPublished || false,
      };

      const article = new KnowledgeArticle(articleData);
      await article.save();

      await cacheService.delPattern('knowledge:list:*');

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: { article }
      });

    } catch (error) {
      logger.error('Create article error:', error);
      next(error);
    }
  }

  async updateArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const article = await KnowledgeArticle.findById(id);

      if (!article) {
        res.status(404).json({
          success: false,
          message: 'Article not found'
        });
        return;
      }

      if (article.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to update this article'
        });
        return;
      }

      Object.assign(article, updates);
      await article.save();

      await cacheService.del(CacheKeys.knowledgeArticle(id));
      await cacheService.delPattern('knowledge:list:*');

      res.status(200).json({
        success: true,
        message: 'Article updated successfully',
        data: { article }
      });

    } catch (error) {
      logger.error('Update article error:', error);
      next(error);
    }
  }

  async deleteArticle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const article = await KnowledgeArticle.findById(id);

      if (!article) {
        res.status(404).json({
          success: false,
          message: 'Article not found'
        });
        return;
      }

      if (article.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this article'
        });
        return;
      }

      await KnowledgeArticle.findByIdAndDelete(id);

      await cacheService.del(CacheKeys.knowledgeArticle(id));
      await cacheService.delPattern('knowledge:list:*');

      res.status(200).json({
        success: true,
        message: 'Article deleted successfully'
      });

    } catch (error) {
      logger.error('Delete article error:', error);
      next(error);
    }
  }

  async markHelpful(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { helpful } = req.body;

      const article = await KnowledgeArticle.findById(id);

      if (!article) {
        res.status(404).json({
          success: false,
          message: 'Article not found'
        });
        return;
      }

      await article.markHelpful(helpful);

      await cacheService.del(CacheKeys.knowledgeArticle(id));

      res.status(200).json({
        success: true,
        message: 'Feedback recorded successfully',
        data: {
          helpful: article.helpful,
          notHelpful: article.notHelpful
        }
      });

    } catch (error) {
      logger.error('Mark helpful error:', error);
      next(error);
    }
  }
}

export const knowledgeController = new KnowledgeController();
