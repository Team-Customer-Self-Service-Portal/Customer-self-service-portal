import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate, authValidation } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(authValidation.register), authController.register.bind(authController));
router.post('/login', authLimiter, validate(authValidation.login), authController.login.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/forgot-password', authLimiter, validate(authValidation.forgotPassword), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;
