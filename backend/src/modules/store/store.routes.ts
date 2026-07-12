import { Router } from 'express';
import { storeController } from './store.controller';

const router = Router();

router.get('/', storeController.findAll);
router.get('/:id', storeController.findById);
router.post('/', storeController.create);
router.put('/:id', storeController.update);
router.delete('/:id', storeController.delete);

export const storeRoutes = router;
