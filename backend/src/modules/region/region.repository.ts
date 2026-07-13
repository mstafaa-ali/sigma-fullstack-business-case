import { BaseRepository } from '../shared/base.repository';

export interface Region {
  id: number;
  province: string;
  region_name: string;
  created_at: Date;
  updated_at: Date;
}

export class RegionRepository extends BaseRepository<Region> {
  constructor() {
    super('regions');
  }

  async findByProvince(province: string): Promise<Region | null> {
    const row = await this.knex(this.tableName).where({ province }).first();
    return (row as Region) || null;
  }
}

export const regionRepository = new RegionRepository();
