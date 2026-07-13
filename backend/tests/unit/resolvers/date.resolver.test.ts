import { describe, it, expect } from 'vitest';
import { DateResolver } from '../../../src/modules/transformation/resolvers/date.resolver';

describe('DateResolver', () => {
  const resolver = new DateResolver();

  it('should format valid string date correctly', () => {
    const result = resolver.format('2026-06-08');
    expect(result.formatted).toBe('08/06/2026');
    expect(result.year).toBe(2026);
    expect(result.monthName).toBe('Juni');
    expect(result.monthNumber).toBe(6);
  });

  it('should format Date object correctly', () => {
    const date = new Date('2026-01-15T00:00:00.000Z');
    const result = resolver.format(date);
    expect(result.formatted).toBe('15/01/2026');
    expect(result.monthName).toBe('Januari');
  });

  it('should parse Excel serial number correctly', () => {
    // 45816 is approx 2025-06-08 (actually 2025-06-08 in excel serial)
    // 46181 is 2026-06-08
    const result = resolver.format(46181);
    expect(result.year).toBe(2026);
    expect(result.monthName).toBe('Juni');
    expect(result.formatted).toBe('08/06/2026');
  });

  it('should throw error for null or undefined', () => {
    expect(() => resolver.format(null)).toThrow('Date is required');
    expect(() => resolver.format(undefined)).toThrow('Date is required');
  });

  it('should throw error for invalid string', () => {
    expect(() => resolver.format('not-a-date')).toThrow('Cannot parse date');
  });
});
