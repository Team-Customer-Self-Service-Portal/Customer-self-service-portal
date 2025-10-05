import { Router } from 'express';
import { caseController } from '../controllers/cases';
import { authenticate } from '../middleware/auth';
import { validate, caseValidation } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.post('/', validate(caseValidation.create), caseController.createCase.bind(caseController));
router.get('/', caseController.getCases.bind(caseController));
router.get('/:id', caseController.getCaseById.bind(caseController));
router.put('/:id', validate(caseValidation.update), caseController.updateCase.bind(caseController));
router.delete('/:id', caseController.deleteCase.bind(caseController));
router.post('/:id/comments', validate(caseValidation.addComment), caseController.addComment.bind(caseController));

export default router;
