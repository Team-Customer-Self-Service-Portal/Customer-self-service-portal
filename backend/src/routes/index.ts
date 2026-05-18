import { Router } from 'express';
import authRouter from './auth';
import casesRouter from './cases';
import knowledgeRouter from './knowledge';
import communityRouter from './community';
import usersRouter from './users';

const router = Router();

router.use('/auth', authRouter);
router.use('/cases', casesRouter);
router.use('/knowledge', knowledgeRouter);
router.use('/community', communityRouter);
router.use('/users', usersRouter);

export default router;
