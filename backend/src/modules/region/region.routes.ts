import { Router } from 'express';
import { regionController } from './region.controller';

const router = Router();

router.get('/', regionController.findAll);
router.get('/:id', regionController.findById);
router.post('/', regionController.create);
router.put('/:id', regionController.update);
router.delete('/:id', regionController.delete);

export const regionRoutes = router;
