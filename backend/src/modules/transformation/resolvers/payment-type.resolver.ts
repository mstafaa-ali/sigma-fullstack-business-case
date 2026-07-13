import { PlatformRepository } from '../../platform/platform.repository';

export class PaymentTypeResolver {
  private cache: Map<number, string> = new Map();

  constructor(private repo: PlatformRepository) {}

  async preload(): Promise<void> {
    const platforms = await this.repo.findAll({ limit: 1000 });
    this.cache.clear();
    for (const p of platforms.data) {
      if (p.id) {
        this.cache.set(p.id, p.payment_type);
      }
    }
  }

  resolve(platformId: number, override?: string | null): string | null {
    if (override) {
      return override;
    }
    return this.cache.get(platformId) || null;
  }
}
