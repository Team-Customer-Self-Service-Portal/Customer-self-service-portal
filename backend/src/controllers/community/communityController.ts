import { NextFunction, Response } from 'express';
import { CommunityPost } from '../../models';
import { AuthenticatedRequest } from '../../types';
import { paginate } from '../../utils/helpers';

export const listPosts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, status, tags, sort = 'createdAt', page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (tags) filter.tags = { $in: tags.split(',').map((tag) => tag.trim()) };

    const sortQuery: Record<string, 1 | -1> = sort === 'upvotes' ? { upvotes: -1 } : { createdAt: -1 };
    const result = await paginate(CommunityPost.find(filter).sort(sortQuery), Number(page), Number(limit));

    res.json({ success: true, data: result.data, pagination: { total: result.total, page: result.page, pages: result.pages, limit: Number(limit) || 20 } });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await CommunityPost.create({ ...req.body, authorId: req.user?.userId });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }
    post.comments.push({ body: req.body.body, authorId: req.user?.userId as never, upvotes: [], createdAt: new Date(), isAnswer: false });
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const toggleUpvote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || !req.user?.userId) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }
    const userId = req.user.userId;
    const idx = post.upvotes.findIndex((id) => String(id) === userId);
    if (idx >= 0) {
      post.upvotes.splice(idx, 1);
    } else {
      post.upvotes.push(userId as never);
    }
    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const markAnswer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    post.comments.forEach((comment) => {
      comment.isAnswer = String((comment as unknown as { _id?: unknown })._id) === req.params.commentId;
    });
    post.status = 'answered';

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};
