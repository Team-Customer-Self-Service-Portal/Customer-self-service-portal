import { Router } from 'express';
import { userController } from '../controllers/users';
import { authenticate } from '../middleware/auth';
import { validate, userValidation } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', validate(userValidation.updateProfile), userController.updateProfile.bind(userController));
router.put('/preferences', validate(userValidation.updatePreferences), userController.updatePreferences.bind(userController));
router.post('/avatar', userController.uploadAvatar.bind(userController));

export default router;
