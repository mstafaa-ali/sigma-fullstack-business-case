# Phase 5: Data Transformation & Output Generation

---

## Tujuan Fase

Mengimplementasikan **inti business logic** — transformasi data dari `sales_raw` menjadi `sales_transformed`, kemudian generate 2 file output (FINANCE.XLSX dan MARKETING.XLSX). Seluruh transformasi dilakukan melalui **database lookups** dan **service layer** — bukan hardcode. Ini adalah fase paling critical karena menentukan akurasi data output.

---

## Scope Pekerjaan

1. TransformationService — orchestrate seluruh transformasi
2. Product resolver (termasuk bundling expansion)
3. Platform & Store resolver
4. Admin resolver
5. Advertiser resolver
6. Region resolver
7. Promo code extraction
8. HPP lookup per platform
9. Payment type derivation
10. Date formatting (year, month name, closing date)
11. Output Excel generator (FINANCE.XLSX & MARKETING.XLSX)
12. Update workers dari Phase 4 (transform-data, generate-output)

---

## Requirement

### Prerequisite

- Phase 2 selesai (database seeded dengan master data)
- Phase 3 selesai (repositories tersedia)
- Phase 4 selesai (queue workers tersedia)
- Data sudah ter-insert ke `sales_raw` via parse worker

### Data Transformation Rules (Hasil Analisis)

Berikut adalah **seluruh transformasi yang harus dilakukan**, berdasarkan perbandingan input vs output:

#### Rule 1: Platform Resolution

```
Input (Kanal)    → Output (Platform)
─────────────────────────────────────
"A"              → "WEB"
"SHOPEE"         → "SHOPEE"
"Tiktok Shop"    → "TIKTOK SHOP"
```

Lookup: `platforms` table, kolom `source_kanal` → `platform_name`

#### Rule 2: Store Name Parsing

```
Input (Toko)         → Output (Nama Toko)
──────────────────────────────────────────
"SC"                 → "SC"
"SHOPEE|raya"        → "RAYA"  (split by "|", ambil bagian kedua, uppercase)
"TIKTOK SHOP|TB"     → "TB"   (split by "|", ambil bagian kedua)
```

Lookup: `stores` table, kolom `source_toko` → `store_name`

#### Rule 3: Admin Assignment

```
Store Name  → Admin Name
─────────────────────────
SC          → Putri
TB          → HANDOKO
RAYA        → YAYA
```

Lookup: `admins` table via `stores.id` FK

#### Rule 4: Advertiser Resolution

```
Input (ADV)     → Output (Advertiser)
─────────────────────────────────────
"ADV SATU"      → "ADV SATU"
"ADV DUA"       → "ADV DUA"
"ADV TIGA"      → "ADV TIGA"
NULL (SALES MP) → "ADV EMPAT" (resolve via store mapping)
```

Lookup: `advertisers` table. Jika input ADV NULL (SALES MP tidak punya kolom ADV), resolve dari `store → default_advertiser`.

#### Rule 5: Bundling Expansion

**CRITICAL RULE**: Jika ProductCode adalah bundle (category = 'bundle' di `products` table), expand menjadi multiple rows:

```
Input:
  OrderNumber: TES-21-6, ProductCode: BDL01, Qty: 1, UnitPrice: 280000

Output (2 rows):
  Row 1: ProductName: "BOXL A", Qty: 1, Omzet: varies by output, HPP: 27000
  Row 2: ProductName: "BOXL B", Qty: 1, Omzet: varies by output, HPP: 22500
```

Lookup:
1. `products` → check category = 'bundle'
2. `bundle_items` → get child items
3. `bundle_price_splits` atau `price_rules` → get per-item prices

**PENTING**: Omzet per bundle item **berbeda antara FINANCE dan MARKETING**:

| Item | FINANCE Omzet | MARKETING Omzet |
|------|---------------|-----------------|
| BOXL A | 175,000 | 190,000 |
| BOXL B | 93,000 | 90,000 |

Ini berarti bundle price split disimpan per output type di database.

#### Rule 6: HPP Lookup

HPP berbeda per product + platform:

```
ProductCode  Platform      HPP
──────────────────────────────
PR01         WEB          56,000
PR01         SHOPEE       84,000
BRG01        WEB          36,000
BOXL_A       TIKTOK SHOP  27,000
BOXL_B       TIKTOK SHOP  22,500
```

Lookup: `price_rules` table, kolom `product_code` + `platform_id` → `hpp`

HPP output = HPP per unit × Quantity

#### Rule 7: Promo Code Extraction dari Note

```
Input (Note)     → Output (Kode Promo / TaxName)
─────────────────────────────────────────────────
"ZIP"            → "ZIP"
"ZP"             → "ZP"
"LED"            → "LED"
"RN/CO/CODE"     → "CODE"  (split by "/", ambil segment TERAKHIR)
"DS"             → "DS"
" " (space)      → " " (space/empty, bukan NULL)
NULL             → NULL
```

**Rule**: Jika note mengandung `/`, ambil segment terakhir. Jika tidak, gunakan nilai aslinya.

**Catatan**: Di FINANCE.XLSX kolom ini bernama `TaxName(%)`, di MARKETING.XLSX bernama `Kode Promo`.

#### Rule 8: Payment Type Derivation

```
Platform/Kanal  MetodeBayar  → Payment Type
─────────────────────────────────────────────
WEB (A)         TF           → "TF"
SHOPEE          COD          → "Shopee"
TIKTOK SHOP     TF           → "Tiktok"
```

**CATATAN PENTING**: Untuk FINANCE output, row bundle BDL01 di TikTok:
- BOXL A → Payment Type = "Tiktok"
- BOXL B → Payment Type = "Shopee" (!)

Ini menunjukkan bundle items bisa memiliki payment type berbeda. Perlu field `payment_type_override` di `bundle_price_splits` atau `price_rules`.

Lookup: `platforms` table, kolom `payment_type`. Override dari `bundle_price_splits` jika ada.

#### Rule 9: Region Mapping

```
Province                → Region
────────────────────────────────
"Jawa Timur"           → "JAWA"
"Jawa Barat"           → "JAWA"
"Banten"               → "JAWA"
"-" atau NULL          → NULL
```

Lookup: `regions` table, kolom `province` → `region_name`

**Catatan**: Region hanya muncul di MARKETING.XLSX. SALES MP sering memiliki province "-" yang menghasilkan Region NULL.

#### Rule 10: Date Formatting

```
Input                    → Output
─────────────────────────────────────
"2026-06-08" (ISO)       → "08/06/2026" (DD/MM/YYYY) untuk Tanggal
datetime(2026,6,8)       → "08/06/2026" (DD/MM/YYYY) untuk Tanggal
                         → 2026 (Tahun, di MARKETING)
                         → "Juni" (Bulan, di MARKETING, bahasa Indonesia)
```

#### Rule 11: Memo (MARKETING Only)

```
Input (TypeTransaksi)  → Output (Memo)
──────────────────────────────────────
"NC"                   → "NC"
"RN"                   → "RN"
```

Direct mapping dari TypeTransaksi.

#### Rule 12: SKU (MARKETING Only)

```
Input (ProductCode)  → Output (SKU)
─────────────────────────────────────
"PR01"               → "PR01"
"BRG01"              → "BRG01"
"BDL01" (bundle)     → "BDL01" (parent code, bukan item code)

Namun dari data output:
BDL01 → Row 1: SKU = "BDL01" (?)
BDL01 → Row 2: SKU = "BDL02" (?)
```

**Perlu diperiksa**: Output MARKETING menunjukkan SKU BDL01 dan BDL02 untuk bundle items. Ini bisa jadi SKU per bundle item, bukan parent code. Tabel `bundle_items` perlu kolom `sku`.

---

## Struktur Folder yang Dihasilkan

```
backend/src/
├── modules/
│   └── transformation/
│       ├── transformation.service.ts           # Main orchestrator
│       ├── resolvers/
│       │   ├── product.resolver.ts             # Product name + bundling
│       │   ├── platform.resolver.ts            # Platform mapping
│       │   ├── store.resolver.ts               # Store name parsing
│       │   ├── admin.resolver.ts               # Admin assignment
│       │   ├── advertiser.resolver.ts          # Advertiser resolution
│       │   ├── region.resolver.ts              # Province → Region
│       │   ├── promo.resolver.ts               # Note → Promo code
│       │   ├── hpp.resolver.ts                 # HPP lookup
│       │   ├── payment-type.resolver.ts        # Payment type derivation
│       │   └── date.resolver.ts                # Date formatting + Year/Month
│       ├── output/
│       │   ├── output-generator.service.ts     # Orchestrate both outputs
│       │   ├── finance-output.generator.ts     # FINANCE.XLSX generator
│       │   └── marketing-output.generator.ts   # MARKETING.XLSX generator
│       └── dto/
│           ├── transformed-row.dto.ts          # Transformed data shape
│           ├── finance-row.dto.ts              # Finance output row shape
│           └── marketing-row.dto.ts            # Marketing output row shape
│
├── workers/
│   ├── transform-data.worker.ts                # Update: implement transformation
│   └── generate-output.worker.ts               # Update: implement output generation
│
└── templates/                                   # Output Excel templates
    ├── FINANCE_TEMPLATE.xlsx
    └── MARKETING_TEMPLATE.xlsx
```

---

## Daftar File yang Harus Dibuat

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `modules/transformation/transformation.service.ts` | Main transformation orchestrator |
| 2 | `modules/transformation/resolvers/product.resolver.ts` | Product + bundle expansion |
| 3 | `modules/transformation/resolvers/platform.resolver.ts` | Platform mapping |
| 4 | `modules/transformation/resolvers/store.resolver.ts` | Store name parsing |
| 5 | `modules/transformation/resolvers/admin.resolver.ts` | Admin lookup |
| 6 | `modules/transformation/resolvers/advertiser.resolver.ts` | Advertiser resolution |
| 7 | `modules/transformation/resolvers/region.resolver.ts` | Region mapping |
| 8 | `modules/transformation/resolvers/promo.resolver.ts` | Promo extraction |
| 9 | `modules/transformation/resolvers/hpp.resolver.ts` | HPP lookup |
| 10 | `modules/transformation/resolvers/payment-type.resolver.ts` | Payment type |
| 11 | `modules/transformation/resolvers/date.resolver.ts` | Date formatting |
| 12 | `modules/transformation/output/output-generator.service.ts` | Output orchestrator |
| 13 | `modules/transformation/output/finance-output.generator.ts` | FINANCE generator |
| 14 | `modules/transformation/output/marketing-output.generator.ts` | MARKETING generator |
| 15 | `modules/transformation/dto/transformed-row.dto.ts` | Row DTOs |
| 16 | `modules/transformation/dto/finance-row.dto.ts` | Finance DTO |
| 17 | `modules/transformation/dto/marketing-row.dto.ts` | Marketing DTO |
| 18 | Update: `workers/transform-data.worker.ts` | Implement transformation |
| 19 | Update: `workers/generate-output.worker.ts` | Implement output gen |
| 20 | `templates/FINANCE_TEMPLATE.xlsx` | Finance template |
| 21 | `templates/MARKETING_TEMPLATE.xlsx` | Marketing template |

---

## Penjelasan Teknis

### 1. Transformation Service (Orchestrator)

```typescript
// modules/transformation/transformation.service.ts
import { Knex } from 'knex';
import { SalesRawRepository } from '../sales/sales-raw.repository';
import { SalesTransformedRepository } from '../sales/sales-transformed.repository';
import { ProductResolver } from './resolvers/product.resolver';
import { PlatformResolver } from './resolvers/platform.resolver';
import { StoreResolver } from './resolvers/store.resolver';
import { AdminResolver } from './resolvers/admin.resolver';
import { AdvertiserResolver } from './resolvers/advertiser.resolver';
import { RegionResolver } from './resolvers/region.resolver';
import { PromoResolver } from './resolvers/promo.resolver';
import { HppResolver } from './resolvers/hpp.resolver';
import { PaymentTypeResolver } from './resolvers/payment-type.resolver';
import { DateResolver } from './resolvers/date.resolver';
import { TransactionManager } from '../shared/transaction.manager';

export class TransformationService {
  private productResolver: ProductResolver;
  private platformResolver: PlatformResolver;
  private storeResolver: StoreResolver;
  private adminResolver: AdminResolver;
  private advertiserResolver: AdvertiserResolver;
  private regionResolver: RegionResolver;
  private promoResolver: PromoResolver;
  private hppResolver: HppResolver;
  private paymentTypeResolver: PaymentTypeResolver;
  private dateResolver: DateResolver;

  constructor(/* inject all resolvers */) {
    // Initialize resolvers
  }

  /**
   * Pre-load semua master data ke memory untuk performa
   * Disebut sekali sebelum processing dimulai
   */
  async preloadMasterData(): Promise<void> {
    await Promise.all([
      this.productResolver.preload(),
      this.platformResolver.preload(),
      this.storeResolver.preload(),
      this.adminResolver.preload(),
      this.advertiserResolver.preload(),
      this.regionResolver.preload(),
      this.hppResolver.preload(),
    ]);
  }

  /**
   * Transform seluruh sales_raw rows untuk session tertentu
   */
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

    while (true) {
      const rawRows = await salesRawRepo.findBySession(sessionId, {
        limit: BATCH_SIZE,
        offset,
        status: 'pending',
      });

      if (rawRows.length === 0) break;

      const transformedRows = [];

      for (const raw of rawRows) {
        try {
          const rows = await this.transformRow(raw);
          transformedRows.push(...rows);
          successCount++;
        } catch (error: any) {
          errorCount++;
          // Log error per row
          await this.logError(sessionId, raw, error);
        }
      }

      if (transformedRows.length > 0) {
        await TransactionManager.run(async (trx) => {
          await salesTransformedRepo.bulkCreate(transformedRows, trx);
          // Update raw rows status to 'validated'
          const rawIds = rawRows.map(r => r.id);
          await salesRawRepo.updateStatusBatch(rawIds, 'validated', trx);
        });
      }

      offset += BATCH_SIZE;
      onProgress?.(offset, -1); // total unknown
    }

    return { success: successCount, errors: errorCount };
  }

  /**
   * Transform single raw row → 1 or more transformed rows (bundling)
   */
  private async transformRow(raw: SalesRawRow): Promise<TransformedRow[]> {
    // 1. Resolve platform
    const platform = this.platformResolver.resolve(raw.platform_source);

    // 2. Resolve store
    const store = this.storeResolver.resolve(raw.store_source);

    // 3. Resolve admin
    const admin = this.adminResolver.resolveByStore(store.id);

    // 4. Resolve advertiser
    const advertiser = raw.advertiser_source
      ? this.advertiserResolver.resolveBySource(raw.advertiser_source)
      : this.advertiserResolver.resolveByStore(store.id);

    // 5. Resolve region
    const region = this.regionResolver.resolve(raw.province);

    // 6. Resolve promo code
    const promoCode = this.promoResolver.extract(raw.note);

    // 7. Date formatting
    const dateInfo = this.dateResolver.format(raw.order_date);

    // 8. Check if product is bundle
    const product = this.productResolver.resolve(raw.product_code);

    if (product.category === 'bundle') {
      // EXPAND bundle into multiple rows
      return this.expandBundle(raw, product, platform, store, admin,
        advertiser, region, promoCode, dateInfo);
    }

    // 9. Resolve HPP (single product)
    const hpp = this.hppResolver.resolve(raw.product_code, platform.id);

    // 10. Resolve payment type
    const paymentType = this.paymentTypeResolver.resolve(platform.id);

    return [{
      session_id: raw.session_id,
      raw_id: raw.id,
      closing_date: dateInfo.formatted,
      order_date: dateInfo.formatted,
      invoice_number: raw.invoice_number,
      tracking_number: raw.tracking_number,
      expedition: raw.expedition,
      transaction_type: raw.transaction_type,
      advertiser_name: advertiser.advertiser_name,
      platform_name: platform.platform_name,
      store_name: store.store_name,
      admin_name: admin.admin_name,
      product_name: product.product_name,
      product_code_original: raw.product_code,
      quantity: raw.quantity,
      omzet: raw.total_per_line,
      hpp: hpp * raw.quantity,
      promo_code: promoCode,
      total_bayar: raw.total_per_line,
      payment_type: paymentType,
      year: dateInfo.year,
      month_name: dateInfo.monthName,
      memo: raw.transaction_type,
      region: region?.region_name || null,
      sku: raw.product_code,
      is_bundle_item: false,
      bundle_parent_code: null,
    }];
  }

  /**
   * Expand bundle product into individual item rows
   */
  private async expandBundle(
    raw: SalesRawRow,
    product: Product,
    platform: Platform,
    store: Store,
    admin: Admin,
    advertiser: Advertiser,
    region: Region | null,
    promoCode: string | null,
    dateInfo: DateInfo
  ): Promise<TransformedRow[]> {
    const bundleItems = this.productResolver.getBundleItems(raw.product_code);
    const rows: TransformedRow[] = [];

    for (const item of bundleItems) {
      // HPP per bundle item
      const hpp = this.hppResolver.resolveForBundleItem(
        raw.product_code, item.item_code, platform.id
      );

      // Price split per output type — stored in sales_transformed
      // Actual omzet will be resolved during output generation
      const priceSplit = this.hppResolver.getBundlePriceSplit(
        raw.product_code, item.item_code, platform.id
      );

      // Payment type override for bundle items
      const paymentType = priceSplit?.payment_type_override
        || this.paymentTypeResolver.resolve(platform.id);

      rows.push({
        session_id: raw.session_id,
        raw_id: raw.id,
        closing_date: dateInfo.formatted,
        order_date: dateInfo.formatted,
        invoice_number: raw.invoice_number,
        tracking_number: raw.tracking_number,
        expedition: raw.expedition,
        transaction_type: raw.transaction_type,
        advertiser_name: advertiser.advertiser_name,
        platform_name: platform.platform_name,
        store_name: store.store_name,
        admin_name: admin.admin_name,
        product_name: item.item_name,
        product_code_original: raw.product_code,
        quantity: raw.quantity,
        omzet: priceSplit?.finance_price || 0, // Akan di-override per output
        hpp: hpp * raw.quantity,
        promo_code: promoCode,
        total_bayar: priceSplit?.finance_price || 0,
        payment_type: paymentType,
        year: dateInfo.year,
        month_name: dateInfo.monthName,
        memo: raw.transaction_type,
        region: region?.region_name || null,
        sku: item.sku || raw.product_code,
        is_bundle_item: true,
        bundle_parent_code: raw.product_code,
      });
    }

    return rows;
  }
}
```

### 2. Resolver Pattern (Contoh: Platform)

```typescript
// modules/transformation/resolvers/platform.resolver.ts
import { PlatformRepository } from '../../platform/platform.repository';

interface PlatformCache {
  [sourceKanal: string]: {
    id: number;
    platform_name: string;
    payment_type: string;
  };
}

export class PlatformResolver {
  private cache: PlatformCache = {};
  private repo: PlatformRepository;

  constructor(repo: PlatformRepository) {
    this.repo = repo;
  }

  /**
   * Pre-load semua platforms ke cache
   * Dipanggil sekali sebelum batch processing
   */
  async preload(): Promise<void> {
    const platforms = await this.repo.findAll({ limit: 1000 });
    this.cache = {};
    for (const p of platforms.data) {
      this.cache[p.source_kanal.toLowerCase()] = {
        id: p.id,
        platform_name: p.platform_name,
        payment_type: p.payment_type,
      };
    }
  }

  /**
   * Resolve platform dari source kanal
   * Case-insensitive matching
   */
  resolve(sourceKanal: string): { id: number; platform_name: string; payment_type: string } {
    const key = sourceKanal?.toLowerCase()?.trim();
    const result = this.cache[key];
    if (!result) {
      throw new Error(`Unknown platform for kanal: "${sourceKanal}"`);
    }
    return result;
  }
}
```

### 3. Promo Code Resolver

```typescript
// modules/transformation/resolvers/promo.resolver.ts
export class PromoResolver {
  /**
   * Extract promo code from note field
   * Rules:
   * - If note contains "/", take the LAST segment
   * - If note is empty/space, return as-is (preserve space)
   * - If note is null/undefined, return null
   * - Otherwise, return the note as-is
   */
  extract(note: string | null | undefined): string | null {
    if (note === null || note === undefined) return null;

    const trimmed = note.trim();

    // Check for "/" pattern (e.g., "RN/CO/CODE" → "CODE")
    if (note.includes('/')) {
      const segments = note.split('/');
      return segments[segments.length - 1].trim();
    }

    // Return as-is (including empty/space)
    return note;
  }
}
```

### 4. Date Resolver (Bahasa Indonesia)

```typescript
// modules/transformation/resolvers/date.resolver.ts
const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export interface DateInfo {
  formatted: string;   // DD/MM/YYYY
  year: number;
  monthName: string;   // Bahasa Indonesia
  monthNumber: number;
}

export class DateResolver {
  /**
   * Parse various date formats dan output formatted date info
   * Input bisa: ISO string "2026-06-08", Date object, Excel serial number
   */
  format(input: string | Date | number | null): DateInfo {
    if (!input) {
      throw new Error('Date is required');
    }

    let date: Date;

    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'number') {
      // Excel serial number
      date = this.excelSerialToDate(input);
    } else if (typeof input === 'string') {
      date = new Date(input);
    } else {
      throw new Error(`Invalid date format: ${input}`);
    }

    if (isNaN(date.getTime())) {
      throw new Error(`Cannot parse date: ${input}`);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return {
      formatted: `${day}/${month}/${year}`,
      year,
      monthName: MONTH_NAMES_ID[date.getMonth()],
      monthNumber: date.getMonth() + 1,
    };
  }

  private excelSerialToDate(serial: number): Date {
    const utcDays = Math.floor(serial - 25569);
    return new Date(utcDays * 86400 * 1000);
  }
}
```

### 5. Finance Output Generator

```typescript
// modules/transformation/output/finance-output.generator.ts
import ExcelJS from 'exceljs';
import { SalesTransformedRepository } from '../../sales/sales-transformed.repository';

const FINANCE_COLUMNS = [
  'Tanggal Closing',
  'Tanggal Pesanan',
  'No. Invoice',
  'No Resi',
  'Ekspedisi',
  'Type Transaksi',
  'Advertiser',
  'Platform',
  'Nama Toko',
  'Admin',
  'Produk Name',
  'Jumlah',
  'Omzet',
  'HPP Sigma',
  'TaxName(%)',
  'Total Bayar',
  'Payment type',
];

export class FinanceOutputGenerator {
  constructor(
    private salesTransformedRepo: SalesTransformedRepository
  ) {}

  async generate(sessionId: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Header
    worksheet.addRow(FINANCE_COLUMNS);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    // Data
    const rows = await this.salesTransformedRepo.findBySession(sessionId, {
      orderBy: 'invoice_number',
    });

    for (const row of rows) {
      worksheet.addRow([
        row.closing_date,           // Tanggal Closing
        row.order_date,             // Tanggal Pesanan
        row.invoice_number,         // No. Invoice
        row.tracking_number,        // No Resi
        row.expedition,             // Ekspedisi
        row.transaction_type,       // Type Transaksi
        row.advertiser_name,        // Advertiser
        row.platform_name,          // Platform
        row.store_name,             // Nama Toko
        row.admin_name,             // Admin
        row.product_name,           // Produk Name
        row.quantity,               // Jumlah
        row.omzet,                  // Omzet
        row.hpp,                    // HPP Sigma
        row.promo_code,             // TaxName(%)
        row.total_bayar,            // Total Bayar
        row.payment_type,           // Payment type
      ]);
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 10;
        if (length > maxLength) maxLength = length;
      });
      column.width = Math.min(maxLength + 2, 30);
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
```

### 6. Marketing Output Generator

```typescript
// modules/transformation/output/marketing-output.generator.ts
import ExcelJS from 'exceljs';

const MARKETING_COLUMNS = [
  'Tahun',
  'Bulan',
  'Tanggal Closing',
  'Tanggal Pesanan',
  'No. Invoice',
  'No. Resi',
  'Memo',
  'Region',
  'Ekspedisi',
  'Advertiser',
  'Platform',
  'Nama Toko',
  'Admin',
  'Produk',
  'Jumlah',
  'Omzet',
  'HPP',
  'Kode Promo',
  'Total Bayar',
  'Metode Pembayaran',
  'SKU',
];

export class MarketingOutputGenerator {
  constructor(
    private salesTransformedRepo: SalesTransformedRepository
  ) {}

  async generate(sessionId: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.addRow(MARKETING_COLUMNS);

    const rows = await this.salesTransformedRepo.findBySession(sessionId, {
      orderBy: 'invoice_number',
    });

    for (const row of rows) {
      // Note: Omzet for bundle items may differ from FINANCE
      // Use marketing_omzet field or bundle_price_splits
      const omzet = row.is_bundle_item
        ? row.marketing_omzet || row.omzet  // Use marketing-specific price
        : row.omzet;

      worksheet.addRow([
        row.year,                    // Tahun
        row.month_name,              // Bulan
        row.closing_date,            // Tanggal Closing
        row.order_date,              // Tanggal Pesanan
        row.invoice_number,          // No. Invoice
        row.tracking_number,         // No. Resi
        row.memo,                    // Memo
        row.region,                  // Region
        row.expedition,              // Ekspedisi
        row.advertiser_name,         // Advertiser
        row.platform_name,           // Platform
        row.store_name,              // Nama Toko
        row.admin_name,              // Admin
        row.product_name,            // Produk
        row.quantity,                // Jumlah
        omzet,                       // Omzet (marketing-specific)
        row.hpp,                     // HPP
        row.promo_code,              // Kode Promo
        row.total_bayar,             // Total Bayar
        row.payment_type,            // Metode Pembayaran
        row.sku,                     // SKU
      ]);
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
```

### 7. Transform Data Worker (Update)

```typescript
// workers/transform-data.worker.ts
import { Worker, Job } from 'bullmq';
import { TransformationService } from '../modules/transformation/transformation.service';
import { publishProgress } from '../modules/import/sse/sse.service';
import { importQueue } from '../queues/import.queue';
import { JOB_NAMES } from '../queues/queue.constants';

const worker = new Worker(
  QUEUE_NAMES.IMPORT,
  async (job: Job) => {
    if (job.name !== JOB_NAMES.TRANSFORM_DATA) return;

    const { sessionId } = job.data;
    const service = new TransformationService(/* inject deps */);

    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'transforming',
      message: 'Transforming sales data...',
    });

    const result = await service.transformSession(sessionId, (current, total) => {
      job.updateProgress({ current, total });
      publishProgress(sessionId, {
        type: 'progress',
        step: 'transforming',
        current,
        message: `Transformed ${current} rows...`,
      });
    });

    // Dispatch output generation
    await importQueue.add(JOB_NAMES.GENERATE_OUTPUT, { sessionId });

    return result;
  },
  { connection: redisConnection, concurrency: 1 }
);
```

### 8. Generate Output Worker

```typescript
// workers/generate-output.worker.ts
import { Worker, Job } from 'bullmq';
import { FinanceOutputGenerator } from '../modules/transformation/output/finance-output.generator';
import { MarketingOutputGenerator } from '../modules/transformation/output/marketing-output.generator';
import { publishProgress } from '../modules/import/sse/sse.service';
import path from 'path';
import fs from 'fs/promises';

const OUTPUT_DIR = path.resolve(process.cwd(), '../result');

const worker = new Worker(
  QUEUE_NAMES.IMPORT,
  async (job: Job) => {
    if (job.name !== JOB_NAMES.GENERATE_OUTPUT) return;

    const { sessionId } = job.data;

    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'generating',
      message: 'Generating output files...',
    });

    // Generate FINANCE.XLSX
    const financeGen = new FinanceOutputGenerator(/* deps */);
    const financeBuffer = await financeGen.generate(sessionId);
    const financePath = path.join(OUTPUT_DIR, `FINANCE_${sessionId}.XLSX`);
    await fs.writeFile(financePath, financeBuffer);

    await publishProgress(sessionId, {
      type: 'progress',
      step: 'generating',
      current: 1,
      total: 2,
      message: 'FINANCE.XLSX generated',
    });

    // Generate MARKETING.XLSX
    const marketingGen = new MarketingOutputGenerator(/* deps */);
    const marketingBuffer = await marketingGen.generate(sessionId);
    const marketingPath = path.join(OUTPUT_DIR, `MARKETING_${sessionId}.XLSX`);
    await fs.writeFile(marketingPath, marketingBuffer);

    // Update session to completed
    await importRepo.updateSession(sessionId, {
      status: 'completed',
      completed_at: new Date(),
    });

    await publishProgress(sessionId, {
      type: 'completed',
      message: 'Import completed! Output files are ready.',
    });

    return { financePath, marketingPath };
  },
  { connection: redisConnection, concurrency: 1 }
);
```

---

## Checklist

- [ ] TransformationService orchestrate semua resolvers
- [ ] Platform resolver maps kanal → platform name
- [ ] Store resolver parses "PLATFORM|name" format
- [ ] Admin resolver assigns admin per store
- [ ] Advertiser resolver handles NULL ADV for SALES MP
- [ ] Product resolver identifies bundles dan expand
- [ ] Bundle expansion generates correct number of rows
- [ ] HPP resolver returns correct HPP per product+platform
- [ ] Promo resolver extracts "/" pattern correctly
- [ ] Payment type derived from platform (with bundle override)
- [ ] Region resolver maps province → region
- [ ] Date resolver handles ISO, Date object, and Excel serial
- [ ] Month names in Bahasa Indonesia
- [ ] FINANCE.XLSX generated dengan 17 kolom benar
- [ ] MARKETING.XLSX generated dengan 21 kolom benar
- [ ] Bundle items omzet berbeda antara FINANCE dan MARKETING
- [ ] Output files disimpan di folder result/
- [ ] Transform worker → Generate output worker chain berfungsi
- [ ] Error per row tidak menghentikan seluruh proses

---

## Acceptance Criteria

1. ✅ Transform 3 input files → data di `sales_transformed` table akurat
2. ✅ PR01 di WEB memiliki HPP 56000, PR01 di SHOPEE memiliki HPP 84000
3. ✅ BDL01 di-expand menjadi 2 rows (BOXL A + BOXL B)
4. ✅ Note "RN/CO/CODE" → promo code "CODE"
5. ✅ SHOPEE|raya → store name "RAYA", admin "YAYA"
6. ✅ FINANCE.XLSX memiliki 9 rows (header + 8 data rows)
7. ✅ MARKETING.XLSX memiliki 9 rows (header + 8 data rows)
8. ✅ Output data **match persis** dengan expected output di `result/` folder
9. ✅ Kolom Tahun = 2026, Bulan = "Juni" di MARKETING
10. ✅ Download output files via API endpoint berfungsi

---

## Catatan Best Practice

1. **Cache Master Data**: Pre-load semua master data ke Map/Object sebelum batch processing. Jangan query database per-row — itu membuat N+1 query problem
2. **Resolver Pattern**: Setiap resolver bertanggung jawab atas satu aspek transformasi. Ini memudahkan unit testing dan isolasi logic
3. **Error Isolation**: Jika satu row gagal di-transform, log error tapi lanjutkan ke row berikutnya. Jangan fail entire batch
4. **Immutable Transform**: Transform functions harus pure — tidak mutate input. Selalu return new object
5. **Output Accuracy**: Verifikasi output dengan **diff comparison** terhadap expected output. Ini critical untuk acceptance
6. **Template Approach**: Gunakan ExcelJS template loading jika format output memiliki styling khusus (borders, colors, etc.)
7. **Bundle Complexity**: Bundle adalah fitur paling complex. Test secara terpisah dengan unit test dedicated
8. **Decimal Handling**: Gunakan integer arithmetic (sen/cent) untuk monetary calculations, convert ke decimal hanya saat display
