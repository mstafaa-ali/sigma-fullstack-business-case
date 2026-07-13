import { describe, it, expect, vi } from 'vitest';
import { HppResolver } from '../../../src/modules/transformation/resolvers/hpp.resolver';
import { PriceRuleRepository } from '../../../src/modules/price-rule/price-rule.repository';

vi.mock('../../../src/modules/price-rule/price-rule.repository');

describe('HppResolver', () => {
  let resolver: HppResolver;
  let mockRepo: vi.Mocked<PriceRuleRepository>;

  beforeAll(async () => {
    mockRepo = new PriceRuleRepository() as any;
    mockRepo.findAll = vi.fn().mockResolvedValue({
      data: [
        { id: 1, product_code: 'PR01', platform_id: 1, hpp: 50000, bundle_item_code: null },
      ]
    });
    
    mockRepo.getKnex = vi.fn().mockReturnValue(() => ({
      select: vi.fn().mockResolvedValue([
        { bundle_code: 'BDL01', item_code: 'ITM1', platform_id: 1, output_type: 'FINANCE', sell_price: 100000, hpp: 30000, payment_type_override: 'TF' },
        { bundle_code: 'BDL01', item_code: 'ITM1', platform_id: 1, output_type: 'MARKETING', sell_price: 110000, hpp: 30000, payment_type_override: null }
      ])
    })) as any;

    resolver = new HppResolver(mockRepo);
    await resolver.preload();
  });

  it('should resolve standard product HPP', () => {
    const hpp = resolver.resolve('PR01', 1);
    expect(hpp).toBe(50000);
  });

  it('should return 0 for unknown product HPP', () => {
    const hpp = resolver.resolve('UNKNOWN', 1);
    expect(hpp).toBe(0);
  });

  it('should resolve bundle item HPP', () => {
    const hpp = resolver.resolveForBundleItem('BDL01', 'ITM1', 1);
    expect(hpp).toBe(30000);
  });

  it('should return 0 for unknown bundle item HPP', () => {
    const hpp = resolver.resolveForBundleItem('UNKNOWN', 'ITM1', 1);
    expect(hpp).toBe(0);
  });

  it('should resolve bundle price split correctly', () => {
    const split = resolver.getBundlePriceSplit('BDL01', 'ITM1', 1);
    expect(split.finance_price).toBe(100000);
    expect(split.marketing_price).toBe(110000);
    expect(split.payment_type_override).toBe('TF');
  });

  it('should return 0 for unknown bundle price split', () => {
    const split = resolver.getBundlePriceSplit('UNKNOWN', 'ITM1', 1);
    expect(split.finance_price).toBe(0);
    expect(split.marketing_price).toBe(0);
    expect(split.payment_type_override).toBeNull();
  });
});
