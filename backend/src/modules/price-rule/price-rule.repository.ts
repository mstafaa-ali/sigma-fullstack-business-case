import { BaseRepository } from '../shared/base.repository';

export interface PriceRule {
  id: number;
  product_code: string;
  platform_id: number;
  bundle_item_code: string | null;
  hpp: number;
  created_at: Date;
  updated_at: Date;
}

export class PriceRuleRepository extends BaseRepository<PriceRule> {
  constructor() {
    super('price_rules');
  }

  async findUniqueRule(product_code: string, platform_id: number, bundle_item_code: string | null): Promise<PriceRule | null> {
    const query = this.knex(this.tableName)
      .where({ product_code, platform_id });
    
    if (bundle_item_code) {
      query.where({ bundle_item_code });
    } else {
      query.whereNull('bundle_item_code');
    }
    
    const row = await query.first();
    return (row as PriceRule) || null;
  }
}

export const priceRuleRepository = new PriceRuleRepository();
