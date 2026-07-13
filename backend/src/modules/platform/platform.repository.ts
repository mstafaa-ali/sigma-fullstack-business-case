import { BaseRepository } from '../shared/base.repository';

export interface Platform {
  id: number;
  source_kanal: string;
  platform_name: string;
  payment_type: string;
  created_at: Date;
  updated_at: Date;
}

export class PlatformRepository extends BaseRepository<Platform> {
  constructor() {
    super('platforms');
  }

  async findBySourceKanal(source_kanal: string): Promise<Platform | null> {
    const row = await this.knex(this.tableName).where({ source_kanal }).first();
    return (row as Platform) || null;
  }
}

export const platformRepository = new PlatformRepository();
