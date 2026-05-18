import { Router } from 'express';
import { createKnowledge, getKnowledgeById, listKnowledge, updateKnowledge, voteHelpful } from '../controllers/knowledge';
import { requireAgent, verifyToken } from '../middleware/auth';
import { createArticleValidator } from '../middleware/validation';

const router = Router();

router.get('/', listKnowledge);
router.get('/:id', getKnowledgeById);
router.post('/:id/helpful', verifyToken, voteHelpful);
router.post('/', verifyToken, requireAgent, createArticleValidator, createKnowledge);
router.put('/:id', verifyToken, requireAgent, updateKnowledge);

export default router;
