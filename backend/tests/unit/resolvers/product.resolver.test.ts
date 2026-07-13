import { describe, it, expect, vi } from 'vitest';
import { ProductResolver } from '../../../src/modules/transformation/resolvers/product.resolver';
import { ProductRepository } from '../../../src/modules/product/product.repository';

vi.mock('../../../src/modules/product/product.repository');

describe('ProductResolver', () => {
  let resolver: ProductResolver;
  let mockRepo: vi.Mocked<ProductRepository>;

  beforeAll(async () => {
    mockRepo = new ProductRepository() as any;
    mockRepo.findAll = vi.fn().mockResolvedValue({
      data: [
        { id: 1, product_code: 'PR01', product_name: 'Product 1', category: 'regular' },
        { id: 2, product_code: 'BDL01', product_name: 'Bundle 1', category: 'bundle' }
      ]
    });
    
    mockRepo.getKnex = vi.fn().mockReturnValue(() => ({
      select: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([
          { bundle_code: 'BDL01', item_code: 'ITM1', item_name: 'Item 1', sort_order: 1 },
          { bundle_code: 'BDL01', item_code: 'ITM2', item_name: 'Item 2', sort_order: 2 }
        ])
      })
    })) as any;

    resolver = new ProductResolver(mockRepo);
    await resolver.preload();
  });

  it('should resolve existing product code', () => {
    const product = resolver.resolve('PR01');
    expect(product.product_name).toBe('Product 1');
    expect(product.category).toBe('regular');
  });

  it('should be case-insensitive', () => {
    const product = resolver.resolve('pr01');
    expect(product.product_name).toBe('Product 1');
  });

  it('should return fallback product for unknown code', () => {
    const product = resolver.resolve('UNKNOWN');
    expect(product.product_name).toBe('UNKNOWN');
    expect(product.category).toBe('regular');
  });

  it('should throw error if code is empty', () => {
    expect(() => resolver.resolve('')).toThrow('Product code is empty');
  });

  it('should return bundle items', () => {
    const items = resolver.getBundleItems('BDL01');
    expect(items.length).toBe(2);
    expect(items[0].item_code).toBe('ITM1');
  });

  it('should throw error if bundle not found', () => {
    expect(() => resolver.getBundleItems('UNKNOWN')).toThrow('Bundle items not found');
  });
});
