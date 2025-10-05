import { Router } from 'express';
import authRoutes from './auth';
import caseRoutes from './cases';
import knowledgeRoutes from './knowledge';
import communityRoutes from './community';
import userRoutes from './users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/community', communityRoutes);
router.use('/users', userRoutes);

export default router;
