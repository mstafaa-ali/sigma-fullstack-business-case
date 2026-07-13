import { BaseService } from '../shared/base.service';
import { PriceRule, PriceRuleRepository } from './price-rule.repository';
import { CreatePriceRuleDTO } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDTO } from './dto/update-price-rule.dto';
import { Knex } from 'knex';

export class PriceRuleService extends BaseService<PriceRule, CreatePriceRuleDTO, UpdatePriceRuleDTO> {
  constructor(protected readonly repository: PriceRuleRepository) {
    super(repository);
  }

  async create(data: CreatePriceRuleDTO, trx?: Knex.Transaction): Promise<PriceRule> {
    const existing = await this.repository.findUniqueRule(data.product_code, data.platform_id, data.bundle_item_code || null);
    if (existing) {
      throw new Error('Price rule for this product, platform, and bundle item already exists');
    }
    return super.create(data, trx);
  }
}
