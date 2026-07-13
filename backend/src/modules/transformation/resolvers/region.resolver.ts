import { RegionRepository, Region } from '../../region/region.repository';

export class RegionResolver {
  private cache: Map<string, Region> = new Map();

  constructor(private repo: RegionRepository) {}

  async preload(): Promise<void> {
    const regions = await this.repo.findAll({ limit: 1000 });
    this.cache.clear();
    for (const r of regions.data) {
      if (r.province) {
        this.cache.set(r.province.toLowerCase(), r);
      }
    }
  }

  resolve(province: string | null): Region | null {
    if (!province || province.trim() === '-' || province.trim() === '') {
      return null;
    }
    const region = this.cache.get(province.toLowerCase().trim());
    if (!region) {
      // If we want to return something or null when not found
      return null;
    }
    return region;
  }
}
