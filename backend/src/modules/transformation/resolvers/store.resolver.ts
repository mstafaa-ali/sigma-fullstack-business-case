import { StoreRepository, Store } from '../../store/store.repository';

export class StoreResolver {
  private cache: Map<string, Store> = new Map();

  constructor(private repo: StoreRepository) {}

  async preload(): Promise<void> {
    const stores = await this.repo.findAll({ limit: 1000 });
    this.cache.clear();
    for (const s of stores.data) {
      if (s.source_toko) {
        // According to guidelines, parsing is done if it has "|".
        // But the DB already has `source_toko` e.g., "SHOPEE|raya". 
        // We will cache by `source_toko` lowercase
        this.cache.set(s.source_toko.toLowerCase(), s);
      }
    }
  }

  resolve(sourceToko: string | null): Store {
    const key = sourceToko?.toLowerCase()?.trim();
    if (!key) {
      return this.createFallback(sourceToko);
    }
    const store = this.cache.get(key);
    if (!store) {
      return this.createFallback(sourceToko);
    }
    return store;
  }

  private createFallback(sourceToko: string | null): Store {
    let storeName = sourceToko || '';
    if (storeName.includes('|')) {
      const parts = storeName.split('|');
      storeName = parts[1].trim().toUpperCase();
    } else {
      storeName = storeName.toUpperCase();
    }
    return {
      id: 0,
      source_toko: sourceToko || '',
      store_name: storeName,
      platform_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }
}
