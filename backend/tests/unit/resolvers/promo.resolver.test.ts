import { describe, it, expect } from 'vitest';
import { PromoResolver } from '../../../src/modules/transformation/resolvers/promo.resolver';

describe('PromoResolver', () => {
  const resolver = new PromoResolver();

  it('should extract code when note contains slashes', () => {
    expect(resolver.extract('RN/CO/DISC10')).toBe('DISC10');
    expect(resolver.extract('PROMO/FLASHSALE')).toBe('FLASHSALE');
  });

  it('should return note as-is if no slashes', () => {
    expect(resolver.extract('DISCOUNT50')).toBe('DISCOUNT50');
    expect(resolver.extract(' ')).toBe(' ');
  });

  it('should handle null or undefined', () => {
    expect(resolver.extract(null)).toBeNull();
    expect(resolver.extract(undefined)).toBeNull();
  });
});
