import { Router } from 'express';
import { changePassword, getProfile, listUsers, updateProfile, updateRole } from '../controllers/users';
import { requireAdmin, verifyToken } from '../middleware/auth';

const router = Router();

router.use(verifyToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/', requireAdmin, listUsers);
router.put('/:id/role', requireAdmin, updateRole);

export default router;
