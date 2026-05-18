import { Router } from 'express';
import { forgotPassword, login, logout, me, register, resetPassword } from '../controllers/auth';
import { verifyToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { loginValidator, registerValidator } from '../middleware/validation';

const router = Router();

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, me);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
