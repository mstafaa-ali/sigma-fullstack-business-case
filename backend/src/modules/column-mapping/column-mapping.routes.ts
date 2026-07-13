import { Router } from 'express';
import { columnMappingController } from './column-mapping.controller';

const router = Router();

router.get('/', columnMappingController.findAll);
router.get('/:id', columnMappingController.findById);
router.post('/', columnMappingController.create);
router.put('/:id', columnMappingController.update);
router.delete('/:id', columnMappingController.delete);

export const columnMappingRoutes = router;
