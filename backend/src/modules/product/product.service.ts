import { BaseService } from '../shared/base.service';
import { Product, ProductRepository } from './product.repository';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { TransactionManager } from '../shared/transaction.manager';
import { Knex } from 'knex';

export class ProductService extends BaseService<Product, CreateProductDTO, UpdateProductDTO> {
  constructor(protected readonly repository: ProductRepository) {
    super(repository);
  }

  async findByIdWithBundle(id: number | string): Promise<any> {
    const product = await this.repository.findById(id);
    if (!product) return null;

    let bundle_items: any[] = [];
    if (product.category === 'bundle') {
      bundle_items = await this.repository.findBundleItems(product.product_code);
    }
    
    return { ...product, bundle_items };
  }

  async create(data: CreateProductDTO): Promise<Product> {
    return TransactionManager.run(async (trx) => {
      const existing = await this.repository.findByProductCode(data.product_code);
      if (existing) {
        throw new Error('Product with this product_code already exists');
      }

      const { bundle_items, ...productData } = data;
      const product = await super.create(productData, trx);

      if (product.category === 'bundle' && bundle_items && bundle_items.length > 0) {
        const itemsToInsert = bundle_items.map((item, index) => ({
          bundle_code: product.product_code,
          item_code: item.item_code,
          item_name: item.item_name,
          sort_order: item.sort_order || index + 1,
        }));
        await this.repository.createBundleItems(itemsToInsert, trx);
      }

      return product;
    });
  }

  async update(id: number | string, data: UpdateProductDTO): Promise<Product> {
    return TransactionManager.run(async (trx) => {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error(`Record with id ${id} not found`);
      }

      const { bundle_items, ...updateData } = data;
      
      let product = existing;
      if (Object.keys(updateData).length > 0) {
        product = await super.update(id, updateData, trx);
      }

      const category = updateData.category || existing.category;

      if (category === 'bundle' && bundle_items) {
        await this.repository.deleteBundleItems(existing.product_code, trx);
        if (bundle_items.length > 0) {
          const itemsToInsert = bundle_items.map((item, index) => ({
            bundle_code: existing.product_code,
            item_code: item.item_code,
            item_name: item.item_name,
            sort_order: item.sort_order || index + 1,
          }));
          await this.repository.createBundleItems(itemsToInsert, trx);
        }
      } else if (category === 'single') {
        await this.repository.deleteBundleItems(existing.product_code, trx);
      }

      return product;
    });
  }
}
