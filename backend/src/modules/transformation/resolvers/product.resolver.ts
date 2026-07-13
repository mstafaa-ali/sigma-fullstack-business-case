import { ProductRepository, Product, BundleItem } from '../../product/product.repository';

export class ProductResolver {
  private productsCache: Map<string, Product> = new Map();
  private bundleItemsCache: Map<string, BundleItem[]> = new Map();
  
  constructor(private productRepo: ProductRepository) {}

  async preload(): Promise<void> {
    const products = await this.productRepo.findAll({ limit: 10000 });
    this.productsCache.clear();
    for (const p of products.data) {
      this.productsCache.set(p.product_code.toUpperCase(), p);
    }
    
    // In a real app we might load all bundle items or query them
    // Let's assume we can fetch them all since master data is small
    const allBundleItems = await this.productRepo.getKnex()('bundle_items').select('*').orderBy('sort_order', 'asc');
    this.bundleItemsCache.clear();
    for (const item of allBundleItems) {
      const bundleCode = item.bundle_code.toUpperCase();
      if (!this.bundleItemsCache.has(bundleCode)) {
        this.bundleItemsCache.set(bundleCode, []);
      }
      this.bundleItemsCache.get(bundleCode)!.push(item as BundleItem);
    }
  }

  resolve(productCode: string): Product {
    if (!productCode) {
      throw new Error('Product code is empty');
    }
    const product = this.productsCache.get(productCode.toUpperCase());
    if (!product) {
      // Return a dummy/fallback product if not found
      return {
        id: 0,
        product_code: productCode,
        product_name: productCode,
        category: 'regular',
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    return product;
  }

  getBundleItems(productCode: string): BundleItem[] {
    const items = this.bundleItemsCache.get(productCode.toUpperCase());
    if (!items || items.length === 0) {
      throw new Error(`Bundle items not found for bundle: ${productCode}`);
    }
    return items;
  }
}
