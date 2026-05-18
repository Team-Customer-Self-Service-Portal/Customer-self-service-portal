import { Router } from 'express';
import { communityController } from '../controllers/community';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, communityValidation } from '../middleware/validation';

const router = Router();

router.get('/', optionalAuth, communityController.getPosts.bind(communityController));
router.get('/:id', optionalAuth, communityController.getPostById.bind(communityController));
router.post('/', authenticate, validate(communityValidation.create), communityController.createPost.bind(communityController));
router.put('/:id', authenticate, validate(communityValidation.update), communityController.updatePost.bind(communityController));
router.delete('/:id', authenticate, communityController.deletePost.bind(communityController));
router.post('/:id/replies', authenticate, validate(communityValidation.addReply), communityController.addReply.bind(communityController));
router.post('/:id/vote', authenticate, communityController.votePost.bind(communityController));

export default router;
