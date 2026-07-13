import { PlatformRepository, Platform } from '../../platform/platform.repository';

interface PlatformCache {
  [sourceKanal: string]: Platform;
}

export class PlatformResolver {
  private cache: PlatformCache = {};

  constructor(private repo: PlatformRepository) {}

  async preload(): Promise<void> {
    const platforms = await this.repo.findAll({ limit: 1000 });
    this.cache = {};
    for (const p of platforms.data) {
      if (p.source_kanal) {
        this.cache[p.source_kanal.toLowerCase()] = p;
      }
    }
  }

  resolve(sourceKanal: string | null): Platform {
    const key = sourceKanal?.toLowerCase()?.trim();
    if (!key) {
      // Fallback if no source_kanal provided
      return {
        id: 0,
        source_kanal: sourceKanal || '',
        platform_name: sourceKanal || '',
        payment_type: '',
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
    const result = this.cache[key];
    if (!result) {
      // Return fallback to prevent blocking the whole batch
      return {
        id: 0,
        source_kanal: sourceKanal || '',
        platform_name: sourceKanal || '',
        payment_type: '',
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
    return result;
  }
}
