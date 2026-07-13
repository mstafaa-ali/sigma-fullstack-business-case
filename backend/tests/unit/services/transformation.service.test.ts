import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransformationService } from '../../../src/modules/transformation/transformation.service';
import { mockSalesRaw, mockProduct, mockPlatform, mockStore, mockAdmin, mockAdvertiser, mockRegion } from '../../helpers/test-fixtures';

describe('TransformationService', () => {
  let service: TransformationService;
  
  // Create mock resolvers
  const productResolver = {
    preload: vi.fn(),
    resolve: vi.fn().mockReturnValue(mockProduct),
    getBundleItems: vi.fn().mockReturnValue([{ item_code: 'ITM1', item_name: 'Item 1' }, { item_code: 'ITM2', item_name: 'Item 2' }])
  } as any;

  const platformResolver = { preload: vi.fn(), resolve: vi.fn().mockReturnValue(mockPlatform) } as any;
  const storeResolver = { preload: vi.fn(), resolve: vi.fn().mockReturnValue(mockStore) } as any;
  const adminResolver = { preload: vi.fn(), resolveByStore: vi.fn().mockReturnValue(mockAdmin) } as any;
  const advertiserResolver = { preload: vi.fn(), resolveBySource: vi.fn().mockReturnValue(mockAdvertiser), resolveByStore: vi.fn() } as any;
  const regionResolver = { preload: vi.fn(), resolve: vi.fn().mockReturnValue(mockRegion) } as any;
  const promoResolver = { extract: vi.fn().mockReturnValue('DISC10') } as any;
  const hppResolver = { 
    preload: vi.fn(), 
    resolve: vi.fn().mockReturnValue(50000),
    resolveForBundleItem: vi.fn().mockReturnValue(25000),
    getBundlePriceSplit: vi.fn().mockReturnValue({ finance_price: 60000, marketing_price: 65000, payment_type_override: null })
  } as any;
  const paymentTypeResolver = { preload: vi.fn(), resolve: vi.fn().mockReturnValue('TF') } as any;
  const dateResolver = { format: vi.fn().mockReturnValue({ dateObj: new Date('2026-06-08'), year: 2026, monthName: 'Juni', formatted: '08/06/2026' }) } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TransformationService(
      productResolver, platformResolver, storeResolver, adminResolver, advertiserResolver,
      regionResolver, promoResolver, hppResolver, paymentTypeResolver, dateResolver
    );
  });

  it('should transform regular product into one row', async () => {
    // We can call the private method using any casting for testing
    const rows = await (service as any).transformRow(mockSalesRaw);
    
    expect(rows).toHaveLength(1);
    expect(rows[0].product_name).toBe('Product 1');
    expect(rows[0].is_bundle_item).toBe(false);
    expect(rows[0].hpp).toBe(50000); // 50000 * 1
    expect(rows[0].promo_code).toBe('DISC10');
  });

  it('should expand bundle product into multiple rows', async () => {
    // Change product resolver to return a bundle
    productResolver.resolve.mockReturnValueOnce({ ...mockProduct, category: 'bundle', product_code: 'BDL01' });

    const rows = await (service as any).transformRow(mockSalesRaw);

    expect(rows).toHaveLength(2); // Mock returns 2 bundle items
    expect(rows[0].product_name).toBe('Item 1');
    expect(rows[0].is_bundle_item).toBe(true);
    expect(rows[0].bundle_parent_code).toBe('BDL01');
    expect(rows[0].omzet).toBe(60000);
    expect(rows[0].marketing_omzet).toBe(65000);
  });
});
