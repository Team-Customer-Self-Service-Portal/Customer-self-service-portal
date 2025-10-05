import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledge';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, knowledgeValidation } from '../middleware/validation';

const router = Router();

router.get('/', optionalAuth, validate(knowledgeValidation.search), knowledgeController.getArticles.bind(knowledgeController));
router.get('/:id', optionalAuth, knowledgeController.getArticleById.bind(knowledgeController));
router.post('/:id/helpful', authenticate, knowledgeController.markHelpful.bind(knowledgeController));
router.post('/', authenticate, validate(knowledgeValidation.create), knowledgeController.createArticle.bind(knowledgeController));
router.put('/:id', authenticate, validate(knowledgeValidation.update), knowledgeController.updateArticle.bind(knowledgeController));
router.delete('/:id', authenticate, knowledgeController.deleteArticle.bind(knowledgeController));

export default router;
