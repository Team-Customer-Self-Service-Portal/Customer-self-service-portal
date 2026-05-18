import { Router } from 'express';
import { addComment, createCase, deleteCase, getCaseById, listCases, updateCase } from '../controllers/cases';
import { requireAdmin, verifyToken } from '../middleware/auth';
import { createCaseValidator, createCommentValidator, updateCaseValidator } from '../middleware/validation';

const router = Router();

router.use(verifyToken);
router.get('/', listCases);
router.post('/', createCaseValidator, createCase);
router.get('/:id', getCaseById);
router.put('/:id', updateCaseValidator, updateCase);
router.delete('/:id', requireAdmin, deleteCase);
router.post('/:id/comments', createCommentValidator, addComment);

export default router;
