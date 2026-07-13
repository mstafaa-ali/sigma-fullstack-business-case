import { AdvertiserRepository, Advertiser } from '../../advertiser/advertiser.repository';

export class AdvertiserResolver {
  private cacheBySource: Map<string, Advertiser> = new Map();
  private cacheByStoreId: Map<number, Advertiser> = new Map();

  constructor(private repo: AdvertiserRepository) {}

  async preload(): Promise<void> {
    const advertisers = await this.repo.findAll({ limit: 1000 });
    this.cacheBySource.clear();
    this.cacheByStoreId.clear();
    
    for (const adv of advertisers.data) {
      if (adv.source_adv) {
        this.cacheBySource.set(adv.source_adv.toLowerCase(), adv);
      }
      if (adv.store_id) {
        this.cacheByStoreId.set(adv.store_id, adv);
      }
    }
  }

  resolveBySource(sourceAdv: string | null): Advertiser {
    if (!sourceAdv) {
      return this.createFallback(sourceAdv);
    }
    const adv = this.cacheBySource.get(sourceAdv.toLowerCase().trim());
    if (!adv) {
      return this.createFallback(sourceAdv);
    }
    return adv;
  }

  resolveByStore(storeId: number): Advertiser {
    if (!storeId) {
      return this.createFallback('');
    }
    const adv = this.cacheByStoreId.get(storeId);
    if (!adv) {
      return this.createFallback('');
    }
    return adv;
  }

  private createFallback(sourceAdv: string | null): Advertiser {
    return {
      id: 0,
      source_adv: sourceAdv || '',
      advertiser_name: sourceAdv || '',
      store_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }
}
