import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import CommunityPost from '../../models/Community';
import { logger } from '../../utils/logger';
import { cacheService, CacheKeys } from '../../services/cache/cacheService';

class CommunityController {
  async getPosts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, page = 1, limit = 10, sort = 'recent' } = req.query;

      const cacheKey = CacheKeys.communityList(category as string, Number(page));
      const cachedPosts = await cacheService.get(cacheKey);

      if (cachedPosts) {
        res.status(200).json({
          success: true,
          data: cachedPosts
        });
        return;
      }

      const query: any = {};

      if (category) {
        query.category = category;
      }

      let sortOption: any = { createdAt: -1 };
      if (sort === 'popular') {
        sortOption = { upvotes: -1, views: -1 };
      } else if (sort === 'resolved') {
        sortOption = { isResolved: -1, createdAt: -1 };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [posts, total] = await Promise.all([
        CommunityPost.find(query)
          .sort(sortOption)
          .skip(skip)
          .limit(Number(limit))
          .populate('author', 'firstName lastName email avatar')
          .populate('replies.author', 'firstName lastName email avatar'),
        CommunityPost.countDocuments(query)
      ]);

      const result = {
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      };

      await cacheService.set(cacheKey, result, 300);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Get posts error:', error);
      next(error);
    }
  }

  async getPostById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const cacheKey = CacheKeys.communityPost(id);
      const cachedPost = await cacheService.get(cacheKey);

      if (cachedPost) {
        res.status(200).json({
          success: true,
          data: { post: cachedPost }
        });
        return;
      }

      const post = await CommunityPost.findById(id)
        .populate('author', 'firstName lastName email avatar')
        .populate('replies.author', 'firstName lastName email avatar');

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found'
        });
        return;
      }

      await post.incrementViews();

      await cacheService.set(cacheKey, post, 300);

      res.status(200).json({
        success: true,
        data: { post }
      });

    } catch (error) {
      logger.error('Get post by ID error:', error);
      next(error);
    }
  }

  async createPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, content, category, tags } = req.body;

      const postData = {
        title,
        content,
        category,
        tags: tags || [],
        author: userId,
      };

      const post = new CommunityPost(postData);
      await post.save();

      await cacheService.delPattern('community:list:*');

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post }
      });

    } catch (error) {
      logger.error('Create post error:', error);
      next(error);
    }
  }

  async updatePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const post = await CommunityPost.findById(id);

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found'
        });
        return;
      }

      if (post.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to update this post'
        });
        return;
      }

      Object.assign(post, updates);
      await post.save();

      await cacheService.del(CacheKeys.communityPost(id));
      await cacheService.delPattern('community:list:*');

      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: { post }
      });

    } catch (error) {
      logger.error('Update post error:', error);
      next(error);
    }
  }

  async deletePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const post = await CommunityPost.findById(id);

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found'
        });
        return;
      }

      if (post.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this post'
        });
        return;
      }

      await CommunityPost.findByIdAndDelete(id);

      await cacheService.del(CacheKeys.communityPost(id));
      await cacheService.delPattern('community:list:*');

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
      });

    } catch (error) {
      logger.error('Delete post error:', error);
      next(error);
    }
  }

  async addReply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { content } = req.body;

      const post = await CommunityPost.findById(id);

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found'
        });
        return;
      }

      post.replies.push({
        author: userId as any,
        content,
        upvotes: 0,
        downvotes: 0,
        isAcceptedAnswer: false,
        createdAt: new Date()
      });

      await post.save();

      await cacheService.del(CacheKeys.communityPost(id));

      res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: { post }
      });

    } catch (error) {
      logger.error('Add reply error:', error);
      next(error);
    }
  }

  async votePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { vote } = req.body;

      const post = await CommunityPost.findById(id);

      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found'
        });
        return;
      }

      await post.vote(vote === 'up');

      await cacheService.del(CacheKeys.communityPost(id));

      res.status(200).json({
        success: true,
        message: 'Vote recorded successfully',
        data: {
          upvotes: post.upvotes,
          downvotes: post.downvotes
        }
      });

    } catch (error) {
      logger.error('Vote post error:', error);
      next(error);
    }
  }
}

export const communityController = new CommunityController();
