import { Router } from 'express';
import { platformController } from './platform.controller';

const router = Router();

router.get('/', platformController.findAll);
router.get('/:id', platformController.findById);
router.post('/', platformController.create);
router.put('/:id', platformController.update);
router.delete('/:id', platformController.delete);

export const platformRoutes = router;
