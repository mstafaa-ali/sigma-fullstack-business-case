import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TransformationService } from '../../src/modules/transformation/transformation.service';
import { SalesRawRepository } from '../../src/modules/sales/sales-raw.repository';
import { ImportRepository } from '../../src/modules/import/import.repository';
import { SalesTransformedRepository } from '../../src/modules/sales/sales-transformed.repository';

// Resolvers
import { ProductResolver } from '../../src/modules/transformation/resolvers/product.resolver';
import { PlatformResolver } from '../../src/modules/transformation/resolvers/platform.resolver';
import { StoreResolver } from '../../src/modules/transformation/resolvers/store.resolver';
import { AdminResolver } from '../../src/modules/transformation/resolvers/admin.resolver';
import { AdvertiserResolver } from '../../src/modules/transformation/resolvers/advertiser.resolver';
import { RegionResolver } from '../../src/modules/transformation/resolvers/region.resolver';
import { PromoResolver } from '../../src/modules/transformation/resolvers/promo.resolver';
import { HppResolver } from '../../src/modules/transformation/resolvers/hpp.resolver';
import { PaymentTypeResolver } from '../../src/modules/transformation/resolvers/payment-type.resolver';
import { DateResolver } from '../../src/modules/transformation/resolvers/date.resolver';

// Repos
import { productRepository } from '../../src/modules/product/product.repository';
import { platformRepository } from '../../src/modules/platform/platform.repository';
import { storeRepository } from '../../src/modules/store/store.repository';
import { adminRepository } from '../../src/modules/admin/admin.repository';
import { advertiserRepository } from '../../src/modules/advertiser/advertiser.repository';
import { regionRepository } from '../../src/modules/region/region.repository';
import { priceRuleRepository } from '../../src/modules/price-rule/price-rule.repository';

import knexConfig from '../../knexfile';
import knex from 'knex';

describe('Transformation Pipeline Integration', () => {
  const db = knex(knexConfig);
  const salesRawRepo = new SalesRawRepository();
  const salesTransformedRepo = new SalesTransformedRepository();
  const importRepo = new ImportRepository();
  
  let service: TransformationService;
  let sessionId: string;

  beforeAll(async () => {
    // Clean up
    await db('sales_transformed').del();
    await db('sales_raw').del();
    await db('import_sessions').del();

    const session = await importRepo.create({ status: 'pending', file_names: '[]' });
    sessionId = session.id;

    service = new TransformationService(
      new ProductResolver(productRepository),
      new PlatformResolver(platformRepository),
      new StoreResolver(storeRepository),
      new AdminResolver(adminRepository),
      new AdvertiserResolver(advertiserRepository),
      new RegionResolver(regionRepository),
      new PromoResolver(),
      new HppResolver(priceRuleRepository),
      new PaymentTypeResolver(platformRepository),
      new DateResolver()
    );

    // Insert dummy raw data
    await salesRawRepo.bulkUpsert([
      {
        session_id: sessionId,
        file_type: 'DAILY',
        row_number: 1,
        order_date: new Date('2026-06-08'),
        product_code: 'BDL01', // bundle code
        platform_source: 'Shopee',
        store_source: 'SHOPEE',
        status: 'pending',
      }
    ]);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should transform data and update status', async () => {
    const result = await service.transformSession(sessionId);
    
    expect(result.success).toBeGreaterThan(0);
    expect(result.errors).toBe(0);

    // Verify raw status updated
    const { data: rawData } = await salesRawRepo.findBySessionId(sessionId, { status: 'validated' });
    expect(rawData.length).toBe(1);

    // Verify transformed rows (BDL01 expands to 2 rows based on seeds)
    const dbTransformedRepo = db('sales_transformed').where({ session_id: sessionId });
    const transformed = await dbTransformedRepo.select('*');
    expect(transformed.length).toBeGreaterThan(1);
    expect(transformed[0].is_bundle_item).toBe(true);
  });
});
