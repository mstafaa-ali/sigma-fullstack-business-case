import { BaseRepository } from '../shared/base.repository';
import { Knex } from 'knex';

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface BundleItem {
  id: number;
  bundle_code: string;
  item_code: string;
  item_name: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super('products');
  }

  async findByProductCode(product_code: string): Promise<Product | null> {
    const row = await this.knex(this.tableName).where({ product_code }).first();
    return (row as Product) || null;
  }

  async findBundleItems(bundle_code: string): Promise<BundleItem[]> {
    return this.knex('bundle_items').where({ bundle_code }).orderBy('sort_order', 'asc');
  }

  async createBundleItems(items: Partial<BundleItem>[], trx?: Knex.Transaction): Promise<BundleItem[]> {
    const query = trx ? trx('bundle_items') : this.knex('bundle_items');
    return query.insert(items).returning('*') as Promise<BundleItem[]>;
  }
  
  async deleteBundleItems(bundle_code: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx('bundle_items') : this.knex('bundle_items');
    await query.where({ bundle_code }).delete();
  }
}

export const productRepository = new ProductRepository();
