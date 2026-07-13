import { describe, it, expect, vi } from 'vitest';
import { RegionResolver } from '../../../src/modules/transformation/resolvers/region.resolver';
import { RegionRepository } from '../../../src/modules/region/region.repository';

// Mock the repository
vi.mock('../../../src/modules/region/region.repository');

describe('RegionResolver', () => {
  let resolver: RegionResolver;
  let mockRepo: vi.Mocked<RegionRepository>;

  beforeAll(async () => {
    mockRepo = new RegionRepository() as any;
    mockRepo.findAll = vi.fn().mockResolvedValue({
      data: [
        { id: 1, province: 'Jawa Barat', region_name: 'Jawa' },
        { id: 2, province: 'DKI JAKARTA', region_name: 'Jabodetabek' }
      ]
    });

    resolver = new RegionResolver(mockRepo);
    await resolver.preload();
  });

  it('should resolve existing province', () => {
    const region = resolver.resolve('Jawa Barat');
    expect(region).not.toBeNull();
    expect(region?.region_name).toBe('Jawa');
  });

  it('should be case-insensitive', () => {
    const region = resolver.resolve('dki jakarta');
    expect(region).not.toBeNull();
    expect(region?.region_name).toBe('Jabodetabek');
  });

  it('should return null for empty or dash', () => {
    expect(resolver.resolve(null)).toBeNull();
    expect(resolver.resolve('')).toBeNull();
    expect(resolver.resolve('-')).toBeNull();
  });

  it('should return null for unknown province', () => {
    expect(resolver.resolve('Unknown')).toBeNull();
  });
});
