# Phase 2: Database Design & Migration

---

## Tujuan Fase

Mendesain dan mengimplementasikan schema database PostgreSQL yang menjadi **single source of truth** untuk seluruh business rules. Semua mapping (produk, platform, toko, admin, HPP, region, promo) disimpan di database — bukan hardcode di source code. Fase ini menghasilkan migration files dan seed data yang siap dijalankan.

---

## Scope Pekerjaan

1. Desain ERD (Entity Relationship Diagram) lengkap
2. Knex migration files untuk seluruh tabel
3. Seed data berdasarkan analisis business rules dari file input/output
4. Index strategy untuk performa query optimal
5. Constraint dan unique rules untuk integritas data
6. Upsert logic untuk mencegah duplikasi saat re-import

---

## Requirement

### Prerequisite

- Phase 1 sudah selesai (PostgreSQL running via Docker Compose)
- Knex CLI terinstall (`npx knex`)
- Koneksi database tervalidasi

### Business Rules yang Harus Di-encode ke Database

Berikut business rules yang **ditemukan dari analisis data input vs output**:

#### 1. Product Master (`products`)
| ProductCode | ProductName | Category |
|-------------|-------------|----------|
| PR01 | PRODUK SATU | single |
| BRG01 | BARANG SATU | single |
| BDL01 | (Bundle container) | bundle |

#### 2. Bundle Items (`bundle_items`)
| BundleCode | ItemCode | ItemName | SortOrder |
|------------|----------|----------|-----------|
| BDL01 | BOXL_A | BOXL A | 1 |
| BDL01 | BOXL_B | BOXL B | 2 |

#### 3. Platform Mapping (`platforms`)
| SourceKanal | PlatformName | PaymentType |
|-------------|--------------|-------------|
| A | WEB | TF |
| SHOPEE | SHOPEE | Shopee |
| Tiktok Shop | TIKTOK SHOP | Tiktok |

#### 4. Store Mapping (`stores`)

Toko di input menggunakan format `PLATFORM|nama_toko` atau nama langsung:

| SourceToko | StoreName | PlatformId | AdminId |
|------------|-----------|------------|---------|
| SC | SC | (WEB) | (Putri) |
| SHOPEE\|raya | RAYA | (SHOPEE) | (YAYA) |
| TIKTOK SHOP\|TB | TB | (TIKTOK SHOP) | (HANDOKO) |

#### 5. Admin Mapping (`admins`)
| AdminName | StoreId |
|-----------|---------|
| Putri | (SC) |
| HANDOKO | (TB) |
| YAYA | (RAYA) |

#### 6. HPP per Platform+Product (`price_rules`)

HPP berbeda per platform:

| ProductCode | PlatformId | HPP |
|-------------|------------|-----|
| PR01 | WEB | 56000 |
| PR01 | SHOPEE | 84000 |
| BDL01→BOXL_A | WEB | 27000 |
| BDL01→BOXL_A | TIKTOK SHOP | 27000 |
| BDL01→BOXL_B | WEB | 22500 |
| BDL01→BOXL_B | TIKTOK SHOP | 22500 |
| BRG01 | WEB | 36000 |

#### 7. Advertiser Mapping (`advertisers`)
| SourceADV | AdvertiserName | StoreId |
|-----------|----------------|---------|
| ADV SATU | ADV SATU | (SC) |
| ADV DUA | ADV DUA | (SC) |
| ADV TIGA | ADV TIGA | (TB) |
| ADV EMPAT | ADV EMPAT | (RAYA) |

**Catatan**: SALES MP tidak memiliki kolom ADV — advertiser harus di-resolve dari Store mapping.

#### 8. Region Mapping (`regions`)
| Province | RegionName |
|----------|------------|
| Jawa Timur | JAWA |
| Jawa Barat | JAWA |
| Banten | JAWA |
| DKI Jakarta | JAWA |
| Jawa Tengah | JAWA |
| DI Yogyakarta | JAWA |

**Catatan**: SALES MP menggunakan City/Province yang isinya "-", sehingga Region bisa NULL.

#### 9. Promo/Note Parsing Rules (`promo_rules`)

Note field di input memiliki beberapa pattern:
- `ZIP` → kode promo = `ZIP`
- `ZP` → kode promo = `ZP`
- `LED` → kode promo = `LED`
- `RN/CO/CODE` → kode promo = `CODE` (ambil segment terakhir setelah `/`)
- `DS` → kode promo = `DS`
- ` ` (space/empty) → NULL

Rule: Jika note mengandung `/`, ambil segment terakhir. Jika tidak, gunakan langsung.

#### 10. Column Mapping (`column_mappings`)

Setiap file input memiliki kolom yang berbeda-beda. Mapping ke standard internal:

| FileType | SourceColumn | InternalField |
|----------|-------------|---------------|
| DAILY | Date | order_date |
| DAILY | OrderNumber | invoice_number |
| DAILY | Awb | tracking_number |
| DAILY | Kanal | platform_source |
| DAILY | Toko | store_source |
| DAILY | ADV | advertiser_source |
| DAILY | ProductCode | product_code |
| DAILY | Quantity | quantity |
| DAILY | UnitPrice | unit_price |
| DAILY | Totalperline | total_per_line |
| DAILY | Ekspedisi | expedition |
| DAILY | TypeTransaksi | transaction_type |
| DAILY | Note | note |
| DAILY | MetodeBayar | payment_method_source |
| DAILY | ProvinsiCustomer | province |
| MP | Date | order_date |
| MP | OrderNumber | invoice_number |
| MP | Awb | tracking_number |
| MP | Kanal | platform_source |
| MP | Toko | store_source |
| MP | ProductCode | product_code |
| MP | Quantity | quantity |
| MP | UnitPrice | unit_price |
| MP | Totalperline | total_per_line |
| MP | Ekspedisi | expedition |
| MP | TypeTransaksi | transaction_type |
| MP | Note | note |
| MP | MetodeBayar | payment_method_source |
| MP | Province | province |
| PRODUK | Date | order_date |
| PRODUK | OrderNumber | invoice_number |
| PRODUK | Awb | tracking_number |
| PRODUK | Kanal | platform_source |
| PRODUK | Toko | store_source |
| PRODUK | ADV | advertiser_source |
| PRODUK | ProductCode | product_code |
| PRODUK | Quantity | quantity |
| PRODUK | UnitPrice | unit_price |
| PRODUK | Totalperline | total_per_line |
| PRODUK | Ekspedisi | expedition |
| PRODUK | TypeTransaksi | transaction_type |
| PRODUK | Note | note |
| PRODUK | MetodeBayar | payment_method_source |
| PRODUK | ProvinsiCustomer | province |

---

## Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   platforms      │────<│     stores        │────<│    admins        │
│─────────────────│     │──────────────────│     │─────────────────│
│ id              │     │ id               │     │ id              │
│ source_kanal    │     │ source_toko      │     │ admin_name      │
│ platform_name   │     │ store_name       │     │ store_id (FK)   │
│ payment_type    │     │ platform_id (FK) │     └─────────────────┘
└─────────────────┘     └──────────────────┘
        │                        │
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│  price_rules    │     │  advertisers     │
│─────────────────│     │──────────────────│
│ id              │     │ id               │
│ product_code    │     │ source_adv       │
│ platform_id(FK) │     │ advertiser_name  │
│ bundle_item_code│     │ store_id (FK)    │
│ hpp             │     └──────────────────┘
└─────────────────┘
        │
        │
┌─────────────────┐     ┌──────────────────┐
│   products      │     │  bundle_items    │
│─────────────────│     │──────────────────│
│ id              │     │ id               │
│ product_code    │     │ bundle_code (FK) │
│ product_name   │     │ item_code        │
│ category        │     │ item_name        │
│ (single/bundle) │     │ sort_order       │
└─────────────────┘     └──────────────────┘

┌─────────────────┐     ┌──────────────────┐
│   regions       │     │ column_mappings  │
│─────────────────│     │──────────────────│
│ id              │     │ id               │
│ province        │     │ file_type        │
│ region_name     │     │ source_column    │
└─────────────────┘     │ internal_field   │
                        └──────────────────┘

┌─────────────────────┐     ┌──────────────────────────┐
│  import_sessions    │────<│     import_logs           │
│─────────────────────│     │──────────────────────────│
│ id (UUID)           │     │ id                       │
│ status              │     │ session_id (FK)          │
│ started_at          │     │ file_name                │
│ completed_at        │     │ row_number               │
│ total_rows          │     │ log_level (info/warn/err)│
│ processed_rows      │     │ message                  │
│ success_rows        │     │ raw_data (JSONB)         │
│ error_rows          │     │ created_at               │
│ created_by          │     └──────────────────────────┘
│ file_names (JSONB)  │
└─────────────────────┘

┌──────────────────────────────┐     ┌──────────────────────────────────────┐
│       sales_raw              │     │        sales_transformed             │
│──────────────────────────────│     │──────────────────────────────────────│
│ id                           │     │ id                                   │
│ session_id (FK)              │     │ raw_id (FK → sales_raw)              │
│ file_type (DAILY/MP/PRODUK)  │     │ session_id (FK)                      │
│ row_number                   │     │ closing_date                         │
│ order_date                   │     │ order_date                           │
│ invoice_number               │     │ invoice_number                       │
│ tracking_number              │     │ tracking_number                      │
│ platform_source              │     │ expedition                           │
│ store_source                 │     │ transaction_type                     │
│ advertiser_source            │     │ advertiser_name                      │
│ product_code                 │     │ platform_name                        │
│ quantity                     │     │ store_name                           │
│ unit_price                   │     │ admin_name                           │
│ total_per_line               │     │ product_name                         │
│ expedition                   │     │ product_code_original                │
│ transaction_type             │     │ quantity                             │
│ note                         │     │ omzet                                │
│ payment_method_source        │     │ hpp                                  │
│ province                     │     │ promo_code                           │
│ raw_data (JSONB)             │     │ total_bayar                          │
│ status                       │     │ payment_type                         │
│ created_at                   │     │ year                                 │
│ UNIQUE(session_id,           │     │ month_name                           │
│   invoice_number,            │     │ memo                                 │
│   product_code, row_number)  │     │ region                               │
└──────────────────────────────┘     │ sku                                  │
                                     │ is_bundle_item                       │
                                     │ bundle_parent_code                   │
                                     │ created_at                           │
                                     │ UNIQUE(session_id,                   │
                                     │   invoice_number, product_name,      │
                                     │   product_code_original, row_number) │
                                     └──────────────────────────────────────┘
```

---

## Struktur Folder yang Dihasilkan

```
backend/src/database/
├── migrations/
│   ├── 20260612000001_create_platforms_table.ts
│   ├── 20260612000002_create_stores_table.ts
│   ├── 20260612000003_create_admins_table.ts
│   ├── 20260612000004_create_products_table.ts
│   ├── 20260612000005_create_bundle_items_table.ts
│   ├── 20260612000006_create_price_rules_table.ts
│   ├── 20260612000007_create_advertisers_table.ts
│   ├── 20260612000008_create_regions_table.ts
│   ├── 20260612000009_create_column_mappings_table.ts
│   ├── 20260612000010_create_import_sessions_table.ts
│   ├── 20260612000011_create_import_logs_table.ts
│   ├── 20260612000012_create_sales_raw_table.ts
│   ├── 20260612000013_create_sales_transformed_table.ts
│   └── 20260612000014_create_indexes.ts
└── seeds/
    ├── 01_platforms.ts
    ├── 02_stores.ts
    ├── 03_admins.ts
    ├── 04_products.ts
    ├── 05_bundle_items.ts
    ├── 06_price_rules.ts
    ├── 07_advertisers.ts
    ├── 08_regions.ts
    ├── 09_column_mappings.ts
    └── 10_promo_rules.ts
```

---

## Daftar File yang Harus Dibuat

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `migrations/20260612000001_create_platforms_table.ts` | Tabel platform master |
| 2 | `migrations/20260612000002_create_stores_table.ts` | Tabel store + FK ke platform |
| 3 | `migrations/20260612000003_create_admins_table.ts` | Tabel admin + FK ke store |
| 4 | `migrations/20260612000004_create_products_table.ts` | Tabel produk master |
| 5 | `migrations/20260612000005_create_bundle_items_table.ts` | Tabel bundle items + FK ke products |
| 6 | `migrations/20260612000006_create_price_rules_table.ts` | HPP per product+platform |
| 7 | `migrations/20260612000007_create_advertisers_table.ts` | Advertiser mapping |
| 8 | `migrations/20260612000008_create_regions_table.ts` | Province → Region mapping |
| 9 | `migrations/20260612000009_create_column_mappings_table.ts` | Column mapping per file type |
| 10 | `migrations/20260612000010_create_import_sessions_table.ts` | Import session tracking |
| 11 | `migrations/20260612000011_create_import_logs_table.ts` | Per-row import logs |
| 12 | `migrations/20260612000012_create_sales_raw_table.ts` | Raw imported sales data |
| 13 | `migrations/20260612000013_create_sales_transformed_table.ts` | Transformed output data |
| 14 | `migrations/20260612000014_create_indexes.ts` | All indexes in one migration |
| 15-23 | `seeds/01_*.ts` to `seeds/10_*.ts` | Seed data untuk semua master tables |

---

## Penjelasan Teknis

### 1. Migration Pattern dengan Knex

```typescript
// Contoh: migrations/20260612000001_create_platforms_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('platforms', (table) => {
    table.increments('id').primary();
    table.string('source_kanal', 100).notNullable().unique();
    table.string('platform_name', 100).notNullable();
    table.string('payment_type', 50).notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('platforms');
}
```

### 2. Import Sessions Table (Detail)

```typescript
// Status ENUM: 'pending' | 'validating' | 'processing' | 'transforming' | 'generating' | 'completed' | 'failed'
await knex.schema.createTable('import_sessions', (table) => {
  table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
  table.enum('status', [
    'pending', 'validating', 'processing', 
    'transforming', 'generating', 'completed', 'failed'
  ]).notNullable().defaultTo('pending');
  table.timestamp('started_at').defaultTo(knex.fn.now());
  table.timestamp('completed_at').nullable();
  table.integer('total_rows').defaultTo(0);
  table.integer('processed_rows').defaultTo(0);
  table.integer('success_rows').defaultTo(0);
  table.integer('error_rows').defaultTo(0);
  table.jsonb('file_names').notNullable().defaultTo('[]');
  table.string('created_by', 100).nullable();
  table.timestamps(true, true);
});
```

### 3. Sales Raw dengan JSONB Backup

```typescript
// raw_data menyimpan seluruh row dari Excel sebagai JSONB
// Berguna untuk debugging dan rollback
await knex.schema.createTable('sales_raw', (table) => {
  table.increments('id').primary();
  table.uuid('session_id').notNullable()
    .references('id').inTable('import_sessions').onDelete('CASCADE');
  table.enum('file_type', ['DAILY', 'MP', 'PRODUK']).notNullable();
  table.integer('row_number').notNullable();
  table.date('order_date').nullable();
  table.string('invoice_number', 100).nullable();
  table.string('tracking_number', 100).nullable();
  table.string('platform_source', 100).nullable();
  table.string('store_source', 100).nullable();
  table.string('advertiser_source', 100).nullable();
  table.string('product_code', 50).nullable();
  table.integer('quantity').nullable();
  table.decimal('unit_price', 15, 2).nullable();
  table.decimal('total_per_line', 15, 2).nullable();
  table.string('expedition', 200).nullable();
  table.string('transaction_type', 20).nullable();
  table.text('note').nullable();
  table.string('payment_method_source', 50).nullable();
  table.string('province', 100).nullable();
  table.jsonb('raw_data').nullable();
  table.enum('status', ['pending', 'validated', 'error']).defaultTo('pending');
  table.timestamps(true, true);

  // Unique constraint untuk mencegah duplikasi saat re-import
  table.unique(['session_id', 'invoice_number', 'product_code', 'row_number']);
});
```

### 4. Index Strategy

```typescript
// migrations/20260612000014_create_indexes.ts
export async function up(knex: Knex): Promise<void> {
  // Performance indexes
  await knex.schema.alterTable('sales_raw', (table) => {
    table.index(['session_id', 'status'], 'idx_sales_raw_session_status');
    table.index(['invoice_number'], 'idx_sales_raw_invoice');
    table.index(['product_code'], 'idx_sales_raw_product_code');
    table.index(['order_date'], 'idx_sales_raw_order_date');
  });

  await knex.schema.alterTable('sales_transformed', (table) => {
    table.index(['session_id'], 'idx_sales_transformed_session');
    table.index(['invoice_number'], 'idx_sales_transformed_invoice');
    table.index(['platform_name'], 'idx_sales_transformed_platform');
    table.index(['order_date'], 'idx_sales_transformed_date');
  });

  await knex.schema.alterTable('import_logs', (table) => {
    table.index(['session_id', 'log_level'], 'idx_import_logs_session_level');
  });

  // Lookup indexes for master tables
  await knex.schema.alterTable('price_rules', (table) => {
    table.index(['product_code', 'platform_id'], 'idx_price_rules_lookup');
  });

  await knex.schema.alterTable('stores', (table) => {
    table.index(['source_toko'], 'idx_stores_source');
  });

  await knex.schema.alterTable('regions', (table) => {
    table.index(['province'], 'idx_regions_province');
  });
}
```

### 5. Seed Data Pattern

```typescript
// seeds/01_platforms.ts
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Upsert — safe for re-run
  await knex('platforms')
    .insert([
      { source_kanal: 'A', platform_name: 'WEB', payment_type: 'TF' },
      { source_kanal: 'SHOPEE', platform_name: 'SHOPEE', payment_type: 'Shopee' },
      { source_kanal: 'Tiktok Shop', platform_name: 'TIKTOK SHOP', payment_type: 'Tiktok' },
    ])
    .onConflict('source_kanal')
    .merge(); // Upsert on conflict
}
```

### 6. Bundling Price Split Logic

Dari analisis output FINANCE.XLSX untuk order TES-21-6 (BDL01 = bundle):

| Output Row | ProductName | Omzet | HPP |
|------------|-------------|-------|-----|
| Row 1 | BOXL A | 175000 (FINANCE) / 190000 (MARKETING) | 27000 |
| Row 2 | BOXL B | 93000 (FINANCE) / 90000 (MARKETING) | 22500 |

**Catatan penting**: Omzet untuk bundle items **berbeda antara FINANCE dan MARKETING**. Ini menunjukkan bahwa harga jual per item dalam bundle **di-store secara terpisah di database**, atau ada formula split yang berbeda. Tabel `price_rules` perlu menyimpan `sell_price` per platform juga, atau ada tabel `bundle_price_splits` terpisah.

```typescript
// Tambahan tabel bundle_price_splits jika diperlukan
await knex.schema.createTable('bundle_price_splits', (table) => {
  table.increments('id').primary();
  table.string('bundle_code', 50).notNullable();
  table.string('item_code', 50).notNullable();
  table.integer('platform_id').notNullable()
    .references('id').inTable('platforms');
  table.string('output_type', 20).notNullable(); // 'FINANCE' | 'MARKETING'
  table.decimal('sell_price', 15, 2).notNullable();
  table.decimal('hpp', 15, 2).notNullable();
  table.timestamps(true, true);
  
  table.unique(['bundle_code', 'item_code', 'platform_id', 'output_type']);
});
```

---

## Checklist

- [ ] Semua 13 tabel migration dibuat dan berjalan tanpa error
- [ ] Index migration berhasil
- [ ] `npx knex migrate:latest` berhasil
- [ ] `npx knex seed:run` berhasil dan data ter-populate
- [ ] Foreign key constraints berfungsi (test cascade delete)
- [ ] Unique constraints mencegah duplikasi
- [ ] JSONB columns bisa menyimpan data
- [ ] UUID generation berfungsi untuk import_sessions
- [ ] Enum types berfungsi dengan benar
- [ ] Rollback migration (`npx knex migrate:rollback`) berhasil

---

## Acceptance Criteria

1. ✅ `npx knex migrate:latest` berhasil membuat 13+ tabel
2. ✅ `npx knex seed:run` berhasil mengisi master data
3. ✅ Query `SELECT * FROM platforms` mengembalikan 3 platform (WEB, SHOPEE, TIKTOK SHOP)
4. ✅ Query `SELECT * FROM products` mengembalikan produk master termasuk bundle
5. ✅ Query `SELECT * FROM price_rules` mengembalikan HPP berbeda per platform
6. ✅ Query `SELECT * FROM column_mappings WHERE file_type = 'DAILY'` mengembalikan mapping untuk file SALES DAILY
7. ✅ Insert duplikat ke `sales_raw` menghasilkan conflict error (unique constraint)
8. ✅ Delete `import_sessions` row cascade delete `sales_raw` dan `import_logs`
9. ✅ `npx knex migrate:rollback --all` berhasil tanpa error
10. ✅ Re-run `npx knex seed:run` tidak menghasilkan duplikasi (upsert logic)

---

## Catatan Best Practice

1. **Naming Convention**: Gunakan `snake_case` untuk semua nama tabel dan kolom. PostgreSQL mengkonversi ke lowercase secara default
2. **Timestamps**: Selalu tambahkan `created_at` dan `updated_at` dengan `timestamps(true, true)` di Knex
3. **UUID vs Auto-increment**: Gunakan UUID untuk `import_sessions` (external reference), auto-increment untuk tabel lain (internal lookup)
4. **JSONB vs TEXT**: Gunakan JSONB untuk data yang perlu di-query (raw_data, file_names), TEXT untuk data yang hanya di-store
5. **Decimal Precision**: Gunakan `decimal(15, 2)` untuk semua monetary values. JANGAN gunakan float/double — rounding error bisa terjadi
6. **Soft Delete**: Pertimbangkan `deleted_at` column untuk master tables agar data historis tetap tersedia
7. **Migration Ordering**: Buat migration dalam urutan dependency (platforms → stores → admins, dst)
8. **Seed Idempotency**: Seluruh seed harus safe di-run berulang kali menggunakan `onConflict().merge()`
9. **Index Moderation**: Jangan over-index. Index hanya pada kolom yang sering di-query atau di-join. Terlalu banyak index memperlambat INSERT
10. **Constraint Messages**: PostgreSQL constraint error messages bisa di-customize untuk debugging yang lebih mudah
