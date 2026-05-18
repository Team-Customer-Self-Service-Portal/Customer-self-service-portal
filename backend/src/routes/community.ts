import { Router } from 'express';
import { addComment, createPost, getPostById, listPosts, markAnswer, toggleUpvote } from '../controllers/community';
import { requireAgent, verifyToken } from '../middleware/auth';
import { createCommentValidator, createPostValidator } from '../middleware/validation';

const router = Router();

router.get('/', listPosts);
router.post('/', verifyToken, createPostValidator, createPost);
router.get('/:id', getPostById);
router.post('/:id/comments', verifyToken, createCommentValidator, addComment);
router.put('/:id/upvote', verifyToken, toggleUpvote);
router.put('/:id/comments/:commentId/answer', verifyToken, requireAgent, markAnswer);

export default router;
