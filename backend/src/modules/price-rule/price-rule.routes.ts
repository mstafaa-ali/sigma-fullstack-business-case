import { Router } from 'express';
import { priceRuleController } from './price-rule.controller';

const router = Router();

router.get('/', priceRuleController.findAll);
router.get('/:id', priceRuleController.findById);
router.post('/', priceRuleController.create);
router.put('/:id', priceRuleController.update);
router.delete('/:id', priceRuleController.delete);

export const priceRuleRoutes = router;
