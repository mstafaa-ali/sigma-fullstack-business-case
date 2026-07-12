import { Router } from 'express';
import { productController } from './product.controller';

const router = Router();

router.get('/', productController.findAll);
router.get('/:id', productController.findById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export const productRoutes = router;
