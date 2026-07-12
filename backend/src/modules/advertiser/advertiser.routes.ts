import { Router } from 'express';
import { advertiserController } from './advertiser.controller';

const router = Router();

router.get('/', advertiserController.findAll);
router.get('/:id', advertiserController.findById);
router.post('/', advertiserController.create);
router.put('/:id', advertiserController.update);
router.delete('/:id', advertiserController.delete);

export const advertiserRoutes = router;
