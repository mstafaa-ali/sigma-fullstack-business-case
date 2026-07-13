import { BaseRepository } from '../shared/base.repository';

export interface Advertiser {
  id: number;
  source_adv: string;
  advertiser_name: string;
  store_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export class AdvertiserRepository extends BaseRepository<Advertiser> {
  constructor() {
    super('advertisers');
  }

  async findBySourceAdv(source_adv: string): Promise<Advertiser | null> {
    const row = await this.knex(this.tableName).where({ source_adv }).first();
    return (row as Advertiser) || null;
  }
}

export const advertiserRepository = new AdvertiserRepository();
