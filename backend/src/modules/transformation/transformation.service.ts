import { SalesRawRepository } from '../sales/sales-raw.repository';
import { SalesTransformedRepository } from '../sales/sales-transformed.repository';
import { SalesRawDTO } from '../sales/dto/sales-raw.dto';
import { TransformedRowDTO } from './dto/transformed-row.dto';
import { importRepository } from '../import/import.repository';
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
  ): Promise<{ success: number; errors: number; skipped: number }> {
    await this.preloadMasterData();

    const salesRawRepo = new SalesRawRepository();
    const salesTransformedRepo = new SalesTransformedRepository();
    const BATCH_SIZE = 200;
    let offset = 0;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
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

      const rawWithRows: { rawId: number, rows: TransformedRowDTO[] }[] = [];

      for (const raw of rawRows) {
        try {
          const rows = await this.transformRow(raw);
          rawWithRows.push({ rawId: raw.id, rows });
        } catch (error: any) {
          console.error(`Error transforming row ${raw.id}:`, error);
          errorCount++;
        }
        totalProcessedRawRows++;
      }

      if (rawWithRows.length > 0) {
        const knex = salesTransformedRepo.getKnex();
        
        // Flatten to get all transformed rows
        const allTransformedRows = rawWithRows.flatMap(item => item.rows);
        
        // Find existing records to deduplicate
        const invoiceNumbers = Array.from(new Set(allTransformedRows.map(r => r.invoice_number).filter(Boolean)));
        
        let existingRows: any[] = [];
        if (invoiceNumbers.length > 0) {
           existingRows = await knex('sales_transformed')
            .select('invoice_number', 'product_code_original', 'product_name')
            .whereIn('invoice_number', invoiceNumbers);
        }

        const existingKeys = new Set(
          existingRows.map(r => `${r.invoice_number}|${r.product_code_original}|${r.product_name}`)
        );

        const newTransformedRows: TransformedRowDTO[] = [];
        
        for (const item of rawWithRows) {
          let hasNewRows = false;
          // Retrieve the raw item to get file type if needed
          const raw = rawRows.find(r => r.id === item.rawId) || {} as any;
          
          for (const row of item.rows) {
            const key = `${row.invoice_number}|${row.product_code_original}|${row.product_name}`;
            if (!existingKeys.has(key)) {
              newTransformedRows.push(row);
              existingKeys.add(key); // prevent duplicates within the same chunk
              hasNewRows = true;
            } else {
              // Log the duplicate skip
              await importRepository.createLog({
                session_id: sessionId,
                file_name: `Transformed File: ${raw.file_type || 'Unknown'}`,
                row_number: row.row_number || 0,
                log_level: 'warn',
                message: `Skipped duplicate record: Invoice ${row.invoice_number}, Product ${row.product_name}`,
                raw_data: JSON.stringify(row),
              });
            }
          }
          
          if (hasNewRows) {
            successCount++;
          } else {
            skippedCount++;
          }
        }

        await knex.transaction(async (trx: any) => {
          // Chunk insertions if too many
          const chunkSize = 100;
          for (let i = 0; i < newTransformedRows.length; i += chunkSize) {
            const chunk = newTransformedRows.slice(i, i + chunkSize);
            await trx('sales_transformed').insert(chunk).onConflict(['session_id', 'invoice_number', 'product_name', 'product_code_original', 'row_number']).merge();
          }

          // Update raw rows status to 'validated'
          const rawIds = rawRows.map((r: any) => r.id);
          await trx('sales_raw').whereIn('id', rawIds).update({ status: 'validated', updated_at: new Date() });
        });
      }

      onProgress?.(totalProcessedRawRows, total);
    }

    return { success: successCount, errors: errorCount, skipped: skippedCount };
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
