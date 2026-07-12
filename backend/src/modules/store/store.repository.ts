import { BaseRepository } from '../shared/base.repository';

export interface Store {
  id: number;
  source_toko: string;
  store_name: string;
  platform_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export class StoreRepository extends BaseRepository<Store> {
  constructor() {
    super('stores');
  }

  async findBySourceToko(source_toko: string): Promise<Store | null> {
    const row = await this.knex(this.tableName).where({ source_toko }).first();
    return (row as Store) || null;
  }
}

export const storeRepository = new StoreRepository();
