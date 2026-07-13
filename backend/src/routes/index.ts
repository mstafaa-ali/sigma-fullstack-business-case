import { Router } from 'express';
import { platformRoutes } from '../modules/platform/platform.routes';
import { productRoutes } from '../modules/product/product.routes';
import { storeRoutes } from '../modules/store/store.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { regionRoutes } from '../modules/region/region.routes';
import { advertiserRoutes } from '../modules/advertiser/advertiser.routes';
import { priceRuleRoutes } from '../modules/price-rule/price-rule.routes';
import { columnMappingRoutes } from '../modules/column-mapping/column-mapping.routes';
import { importRoutes } from '../modules/import/import.routes';

const router = Router();

router.use('/platforms', platformRoutes);
router.use('/products', productRoutes);
router.use('/stores', storeRoutes);
router.use('/admins', adminRoutes);
router.use('/regions', regionRoutes);
router.use('/advertisers', advertiserRoutes);
router.use('/price-rules', priceRuleRoutes);
router.use('/column-mappings', columnMappingRoutes);
router.use('/import', importRoutes);

export default router;
