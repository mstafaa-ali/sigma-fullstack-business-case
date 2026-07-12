import { Router } from 'express';
import { adminController } from './admin.controller';

const router = Router();

router.get('/', adminController.findAll);
router.get('/:id', adminController.findById);
router.post('/', adminController.create);
router.put('/:id', adminController.update);
router.delete('/:id', adminController.delete);

export const adminRoutes = router;
