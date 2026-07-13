import { PriceRuleRepository, PriceRule } from '../../price-rule/price-rule.repository';

export interface BundlePriceSplit {
  bundle_code: string;
  item_code: string;
  platform_id: number;
  output_type: string;
  sell_price: number;
  hpp: number;
  payment_type_override?: string; // Optional if we added it in schema, otherwise omitted
}

export class HppResolver {
  // key: `${product_code}_${platform_id}`
  private priceRulesCache: Map<string, PriceRule> = new Map();
  // key: `${bundle_code}_${item_code}_${platform_id}_${output_type}`
  private bundleSplitsCache: Map<string, BundlePriceSplit> = new Map();

  constructor(private repo: PriceRuleRepository) {}

  async preload(): Promise<void> {
    const rules = await this.repo.findAll({ limit: 10000 });
    this.priceRulesCache.clear();
    for (const rule of rules.data) {
      if (!rule.bundle_item_code) {
        this.priceRulesCache.set(`${rule.product_code}_${rule.platform_id}`, rule);
      }
    }

    // Load bundle splits
    const splits = await this.repo.getKnex()('bundle_price_splits').select('*');
    this.bundleSplitsCache.clear();
    for (const split of splits) {
      const key = `${split.bundle_code}_${split.item_code}_${split.platform_id}_${split.output_type}`;
      this.bundleSplitsCache.set(key, split as BundlePriceSplit);
    }
  }

  resolve(productCode: string, platformId: number): number {
    const key = `${productCode}_${platformId}`;
    const rule = this.priceRulesCache.get(key);
    return rule ? Number(rule.hpp) : 0;
  }

  resolveForBundleItem(bundleCode: string, itemCode: string, platformId: number): number {
    // Priority: HPP from bundle_price_splits (assuming finance and marketing HPP are identical, we check FINANCE)
    const splitKey = `${bundleCode}_${itemCode}_${platformId}_FINANCE`;
    const split = this.bundleSplitsCache.get(splitKey);
    if (split) {
      return Number(split.hpp);
    }
    return 0;
  }

  getBundlePriceSplit(bundleCode: string, itemCode: string, platformId: number): { finance_price: number; marketing_price: number; payment_type_override: string | null } {
    const financeKey = `${bundleCode}_${itemCode}_${platformId}_FINANCE`;
    const marketingKey = `${bundleCode}_${itemCode}_${platformId}_MARKETING`;
    
    const financeSplit = this.bundleSplitsCache.get(financeKey);
    const marketingSplit = this.bundleSplitsCache.get(marketingKey);

    return {
      finance_price: financeSplit ? Number(financeSplit.sell_price) : 0,
      marketing_price: marketingSplit ? Number(marketingSplit.sell_price) : 0,
      payment_type_override: financeSplit?.payment_type_override || null
    };
  }
}
