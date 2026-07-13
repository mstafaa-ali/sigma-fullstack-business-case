import { SalesRawRepository } from '../sales/sales-raw.repository';
import { SalesTransformedRepository } from '../sales/sales-transformed.repository';
import { SalesRawDTO } from '../sales/dto/sales-raw.dto';
import { TransformedRowDTO } from './dto/transformed-row.dto';
import { ProductResolver } from './resolvers/product.resolver';
import { PlatformResolver } from './resolvers/platform.resolver';
import { StoreResolver } from './resolvers/store.resolver';
import { AdminResolver } from './resolvers/admin.resolver';
import { AdvertiserResolver } from './resolvers/advertiser.resolver';
import { RegionResolver } from './resolvers/region.resolver';
import { PromoResolver } from './resolvers/promo.resolver';
import { HppResolver } from './resolvers/hpp.resolver';
import { PaymentTypeResolver } from './resolvers/payment-type.resolver';
import { DateResolver, DateInfo } from './resolvers/date.resolver';
import { Product } from '../product/product.repository';
import { Platform } from '../platform/platform.repository';
import { Store } from '../store/store.repository';
import { Admin } from '../admin/admin.repository';
import { Advertiser } from '../advertiser/advertiser.repository';
import { Region } from '../region/region.repository';

export class TransformationService {
  constructor(
    private productResolver: ProductResolver,
    private platformResolver: PlatformResolver,
    private storeResolver: StoreResolver,
    private adminResolver: AdminResolver,
    private advertiserResolver: AdvertiserResolver,
    private regionResolver: RegionResolver,
    private promoResolver: PromoResolver,
    private hppResolver: HppResolver,
    private paymentTypeResolver: PaymentTypeResolver,
    private dateResolver: DateResolver
  ) {}

  async preloadMasterData(): Promise<void> {
    await Promise.all([
      this.productResolver.preload(),
      this.platformResolver.preload(),
      this.storeResolver.preload(),
      this.adminResolver.preload(),
      this.advertiserResolver.preload(),
      this.regionResolver.preload(),
      this.hppResolver.preload(),
      this.paymentTypeResolver.preload(),
    ]);
  }

  async transformSession(
    sessionId: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: number; errors: number }> {
    await this.preloadMasterData();

    const salesRawRepo = new SalesRawRepository();
    const salesTransformedRepo = new SalesTransformedRepository();
    const BATCH_SIZE = 200;
    let offset = 0;
    let successCount = 0;
    let errorCount = 0;
    let totalProcessedRawRows = 0;
    
    // First we get total count
    const { total } = await salesRawRepo.findBySessionId(sessionId, { limit: 1, status: 'pending' });

    while (true) {
      // Need to fetch without offset if we update status to validated because offset shifts
      const { data: rawRows } = await salesRawRepo.findBySessionId(sessionId, {
        limit: BATCH_SIZE,
        status: 'pending',
      });

      if (rawRows.length === 0) break;

      const transformedRows: TransformedRowDTO[] = [];

      for (const raw of rawRows) {
        try {
          const rows = await this.transformRow(raw);
          transformedRows.push(...rows);
          successCount++;
        } catch (error: any) {
          console.error(`Error transforming row ${raw.id}:`, error);
          errorCount++;
        }
        totalProcessedRawRows++;
      }

      if (transformedRows.length > 0) {
        // Use Knex transaction via salesTransformedRepo knex instance
        const knex = salesTransformedRepo.getKnex();
        await knex.transaction(async (trx: any) => {
          // Chunk insertions if too many
          const chunkSize = 100;
          for (let i = 0; i < transformedRows.length; i += chunkSize) {
            const chunk = transformedRows.slice(i, i + chunkSize);
            await trx('sales_transformed').insert(chunk).onConflict(['session_id', 'invoice_number', 'product_name', 'product_code_original', 'row_number']).merge();
          }

          // Update raw rows status to 'validated'
          const rawIds = rawRows.map((r: any) => r.id);
          await trx('sales_raw').whereIn('id', rawIds).update({ status: 'validated', updated_at: new Date() });
        });
      }

      onProgress?.(totalProcessedRawRows, total);
    }

    return { success: successCount, errors: errorCount };
  }

  private async transformRow(raw: SalesRawDTO): Promise<TransformedRowDTO[]> {
    const platform = this.platformResolver.resolve(raw.platform_source);
    const store = this.storeResolver.resolve(raw.store_source);
    const admin = this.adminResolver.resolveByStore(store.id);

    const advertiser = raw.advertiser_source
      ? this.advertiserResolver.resolveBySource(raw.advertiser_source)
      : this.advertiserResolver.resolveByStore(store.id);

    const region = this.regionResolver.resolve(raw.province);
    const promoCode = this.promoResolver.extract(raw.note);
    const dateInfo = this.dateResolver.format(raw.order_date);

    // If product_code is missing we might have a problem but let's handle it
    const productCode = raw.product_code || '';
    const product = this.productResolver.resolve(productCode);

    if (product.category === 'bundle') {
      return this.expandBundle(raw, product, platform, store, admin, advertiser, region, promoCode, dateInfo);
    }

    const hpp = this.hppResolver.resolve(productCode, platform.id);
    const paymentType = this.paymentTypeResolver.resolve(platform.id) || '';

    return [{
      session_id: raw.session_id,
      raw_id: raw.id,
      closing_date: dateInfo.dateObj,
      order_date: dateInfo.dateObj,
      invoice_number: raw.invoice_number || '',
      tracking_number: raw.tracking_number,
      expedition: raw.expedition,
      transaction_type: raw.transaction_type,
      advertiser_name: advertiser.advertiser_name,
      platform_name: platform.platform_name,
      store_name: store.store_name,
      admin_name: admin.admin_name,
      product_name: product.product_name,
      product_code_original: raw.product_code,
      quantity: raw.quantity || 1,
      omzet: raw.total_per_line,
      marketing_omzet: raw.total_per_line,
      hpp: hpp * (raw.quantity || 1),
      promo_code: promoCode,
      total_bayar: raw.total_per_line,
      payment_type: paymentType,
      year: dateInfo.year,
      month_name: dateInfo.monthName,
      memo: raw.transaction_type,
      region: region ? region.region_name : null,
      sku: raw.product_code,
      is_bundle_item: false,
      bundle_parent_code: null,
      row_number: raw.row_number,
    }];
  }

  private async expandBundle(
    raw: SalesRawDTO,
    product: Product,
    platform: Platform,
    store: Store,
    admin: Admin,
    advertiser: Advertiser,
    region: Region | null,
    promoCode: string | null,
    dateInfo: DateInfo
  ): Promise<TransformedRowDTO[]> {
    const bundleItems = this.productResolver.getBundleItems(product.product_code);
    const rows: TransformedRowDTO[] = [];

    for (const item of bundleItems) {
      const hpp = this.hppResolver.resolveForBundleItem(product.product_code, item.item_code, platform.id);
      const priceSplit = this.hppResolver.getBundlePriceSplit(product.product_code, item.item_code, platform.id);
      
      const paymentType = this.paymentTypeResolver.resolve(platform.id, priceSplit.payment_type_override) || '';

      rows.push({
        session_id: raw.session_id,
        raw_id: raw.id,
        closing_date: dateInfo.dateObj,
        order_date: dateInfo.dateObj,
        invoice_number: raw.invoice_number || '',
        tracking_number: raw.tracking_number,
        expedition: raw.expedition,
        transaction_type: raw.transaction_type,
        advertiser_name: advertiser.advertiser_name,
        platform_name: platform.platform_name,
        store_name: store.store_name,
        admin_name: admin.admin_name,
        product_name: item.item_name,
        product_code_original: raw.product_code,
        quantity: raw.quantity || 1,
        omzet: priceSplit.finance_price,
        marketing_omzet: priceSplit.marketing_price,
        hpp: hpp * (raw.quantity || 1),
        promo_code: promoCode,
        total_bayar: priceSplit.finance_price,
        payment_type: paymentType,
        year: dateInfo.year,
        month_name: dateInfo.monthName,
        memo: raw.transaction_type,
        region: region ? region.region_name : null,
        sku: item.item_code,
        is_bundle_item: true,
        bundle_parent_code: product.product_code,
        row_number: raw.row_number,
      });
    }

    return rows;
  }
}
