# Phase 7: Integration Testing, Documentation & Polish

---

## Tujuan Fase

Melakukan **end-to-end testing** seluruh pipeline (upload → validate → parse → transform → generate output), memverifikasi akurasi data output terhadap expected result, menulis dokumentasi (README.md, PROBLEM.md), dan melakukan final polish. Fase ini memastikan sistem production-ready dan semua deliverable lengkap.

---

## Scope Pekerjaan

1. End-to-end integration test (full pipeline)
2. Output accuracy verification (diff comparison)
3. Error scenario testing
4. Performance testing (large files)
5. Rollback data feature (bonus)
6. README.md — instruksi instalasi & penggunaan
7. PROBLEM.md — dokumentasi kendala teknis & solusi
8. Final UI polish & bug fixing
9. Output files generation ke folder `result/`

---

## Requirement

### Prerequisite

- Phase 1-6 selesai dan berfungsi
- PostgreSQL + Redis running locally
- Backend + frontend running
- Seed data ter-populate

### Test Data

Test dengan file input yang disediakan:
- `file/SALES DAILY.xlsx` (4 data rows)
- `file/SALES MP.xlsx` (2 data rows)
- `file/SALES PRODUK.xlsx` (1 data row, includes bundle BDL01)

Expected output (reference):
- `result/FINANCE.XLSX` (8 data rows)
- `result/MARKETING.XLSX` (8 data rows)

---

## Struktur Folder yang Dihasilkan

```
business-case-fullstack-engineer/
├── README.md                          # Instruksi instalasi & penggunaan
├── PROBLEM.md                         # Dokumentasi kendala & solusi
├── result/
│   ├── FINANCE.XLSX                   # Output original (reference)
│   ├── MARKETING.XLSX                 # Output original (reference)
│   ├── FINANCE_<session-id>.XLSX      # Generated output
│   └── MARKETING_<session-id>.XLSX    # Generated output
│
├── backend/
│   ├── tests/
│   │   ├── setup.ts                   # Test configuration & DB setup
│   │   ├── integration/
│   │   │   ├── import-pipeline.test.ts    # Full pipeline E2E test
│   │   │   ├── upload.test.ts             # Upload endpoint tests
│   │   │   ├── transformation.test.ts     # Transformation accuracy
│   │   │   └── output-generation.test.ts  # Output file verification
│   │   ├── unit/
│   │   │   ├── resolvers/
│   │   │   │   ├── product.resolver.test.ts
│   │   │   │   ├── platform.resolver.test.ts
│   │   │   │   ├── store.resolver.test.ts
│   │   │   │   ├── promo.resolver.test.ts
│   │   │   │   ├── date.resolver.test.ts
│   │   │   │   └── hpp.resolver.test.ts
│   │   │   ├── file-validator.test.ts
│   │   │   └── excel-reader.test.ts
│   │   └── fixtures/
│   │       ├── sales-daily-sample.xlsx
│   │       ├── sales-mp-sample.xlsx
│   │       ├── sales-produk-sample.xlsx
│   │       ├── expected-finance.json
│   │       └── expected-marketing.json
│   └── jest.config.ts                 # Jest configuration
│
└── frontend/
    └── tests/                         # (Optional) Component tests
        └── .gitkeep
```

---

## Daftar File yang Harus Dibuat

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `README.md` | Instruksi lengkap instalasi & penggunaan |
| 2 | `PROBLEM.md` | Dokumentasi kendala teknis & solusi |
| 3 | `backend/jest.config.ts` | Jest config untuk TypeScript |
| 4 | `backend/tests/setup.ts` | Test database setup & teardown |
| 5 | `backend/tests/integration/import-pipeline.test.ts` | Full E2E test |
| 6 | `backend/tests/integration/upload.test.ts` | Upload tests |
| 7 | `backend/tests/integration/transformation.test.ts` | Transform tests |
| 8 | `backend/tests/integration/output-generation.test.ts` | Output tests |
| 9 | `backend/tests/unit/resolvers/*.test.ts` | Unit tests per resolver |
| 10 | `backend/tests/unit/file-validator.test.ts` | Validator tests |
| 11 | `backend/tests/unit/excel-reader.test.ts` | Reader tests |
| 12 | `backend/tests/fixtures/*` | Test data fixtures |

---

## Penjelasan Teknis

### 1. Jest Configuration

```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterSetup: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000, // 30s for integration tests
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};

export default config;
```

### 2. Test Setup (Database)

```typescript
// backend/tests/setup.ts
import knex from 'knex';
import { config } from '../src/config';

const testDb = knex({
  client: 'pg',
  connection: {
    ...config.database,
    database: `${config.database.database}_test`, // Separate test DB
  },
});

beforeAll(async () => {
  // Run migrations on test DB
  await testDb.migrate.latest();
  // Seed master data
  await testDb.seed.run();
});

afterAll(async () => {
  // Cleanup
  await testDb.destroy();
});

export { testDb };
```

### 3. Full Pipeline Integration Test

```typescript
// backend/tests/integration/import-pipeline.test.ts
import request from 'supertest';
import path from 'path';
import app from '../../src/app';
import { testDb } from '../setup';
import ExcelJS from 'exceljs';

describe('Import Pipeline E2E', () => {
  const INPUT_DIR = path.resolve(__dirname, '../../../file');
  
  it('should process 3 input files and generate 2 output files', async () => {
    // Step 1: Upload 3 files
    const response = await request(app)
      .post('/api/import/upload')
      .attach('files', path.join(INPUT_DIR, 'SALES DAILY.xlsx'))
      .attach('files', path.join(INPUT_DIR, 'SALES MP.xlsx'))
      .attach('files', path.join(INPUT_DIR, 'SALES PRODUK.xlsx'))
      .expect(202);

    const { sessionId } = response.body.data;
    expect(sessionId).toBeDefined();

    // Step 2: Wait for processing to complete (poll status)
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await request(app)
        .get(`/api/import/sessions/${sessionId}`)
        .expect(200);
      status = statusRes.body.data.status;
      attempts++;
    }

    expect(status).toBe('completed');

    // Step 3: Verify sales_raw row count
    const rawCount = await testDb('sales_raw')
      .where({ session_id: sessionId })
      .count('* as count')
      .first();
    expect(Number(rawCount.count)).toBe(7); // 4 + 2 + 1

    // Step 4: Verify sales_transformed row count (includes bundle expansion)
    const transformedCount = await testDb('sales_transformed')
      .where({ session_id: sessionId })
      .count('* as count')
      .first();
    expect(Number(transformedCount.count)).toBe(8); // 7 + 1 (bundle expansion)

    // Step 5: Download and verify FINANCE output
    const financeRes = await request(app)
      .get(`/api/import/sessions/${sessionId}/output/finance`)
      .expect(200);
    
    expect(financeRes.headers['content-type']).toContain('spreadsheetml');

    // Step 6: Download and verify MARKETING output
    const marketingRes = await request(app)
      .get(`/api/import/sessions/${sessionId}/output/marketing`)
      .expect(200);
    
    expect(marketingRes.headers['content-type']).toContain('spreadsheetml');
  }, 120000); // 2 minute timeout

  it('should reject upload with less than 3 files', async () => {
    await request(app)
      .post('/api/import/upload')
      .attach('files', path.join(INPUT_DIR, 'SALES DAILY.xlsx'))
      .expect(400);
  });

  it('should reject non-Excel files', async () => {
    await request(app)
      .post('/api/import/upload')
      .attach('files', path.join(INPUT_DIR, 'SALES DAILY.xlsx'))
      .attach('files', path.join(INPUT_DIR, 'SALES MP.xlsx'))
      .attach('files', path.resolve(__dirname, '../../README.md')) // Non-Excel
      .expect(400);
  });
});
```

### 4. Transformation Accuracy Test

```typescript
// backend/tests/integration/transformation.test.ts
describe('Data Transformation Accuracy', () => {
  // Expected data derived from result/FINANCE.XLSX
  const EXPECTED_FINANCE_ROWS = [
    {
      invoice: 'TES-21-1', product: 'PRODUK SATU', qty: 1,
      omzet: 140000, hpp: 56000, platform: 'WEB', store: 'SC',
      admin: 'Putri', adv: 'ADV SATU', promo: 'ZIP', payment: 'TF',
    },
    {
      invoice: 'TES-21-3', product: 'BARANG SATU', qty: 2,
      omzet: 180000, hpp: 72000, platform: 'WEB', store: 'SC',
      admin: 'Putri', adv: 'ADV DUA', promo: 'CODE', payment: 'TF',
    },
    {
      invoice: 'TES-21-4', product: 'PRODUK SATU', qty: 1,
      omzet: 140000, hpp: 56000, platform: 'WEB', store: 'SC',
      admin: 'Putri', adv: 'ADV SATU', promo: 'LED', payment: 'TF',
    },
    {
      invoice: 'TES-21-5', product: 'PRODUK SATU', qty: 2,
      omzet: 274000, hpp: 112000, platform: 'WEB', store: 'SC',
      admin: 'Putri', adv: 'ADV SATU', promo: 'ZP', payment: 'TF',
    },
    // Bundle row 1
    {
      invoice: 'TES-21-6', product: 'BOXL A', qty: 1,
      omzet: 175000, hpp: 27000, platform: 'TIKTOK SHOP', store: 'TB',
      admin: 'HANDOKO', adv: 'ADV TIGA', promo: null, payment: 'Tiktok',
    },
    // Bundle row 2
    {
      invoice: 'TES-21-6', product: 'BOXL B', qty: 1,
      omzet: 93000, hpp: 22500, platform: 'TIKTOK SHOP', store: 'TB',
      admin: 'HANDOKO', adv: 'ADV TIGA', promo: null, payment: 'Shopee',
    },
    {
      invoice: 'TES-21-7', product: 'PRODUK SATU', qty: 1,
      omzet: 147000, hpp: 84000, platform: 'SHOPEE', store: 'RAYA',
      admin: 'YAYA', adv: 'ADV EMPAT', promo: ' ', payment: 'Shopee',
    },
    {
      invoice: 'TES-21-8', product: 'PRODUK SATU', qty: 1,
      omzet: 147000, hpp: 84000, platform: 'SHOPEE', store: 'RAYA',
      admin: 'YAYA', adv: 'ADV EMPAT', promo: 'DS', payment: 'Shopee',
    },
  ];

  it('should produce correct FINANCE output data', async () => {
    const transformed = await testDb('sales_transformed')
      .where({ session_id: testSessionId })
      .orderBy('invoice_number')
      .orderBy('product_name');

    expect(transformed.length).toBe(EXPECTED_FINANCE_ROWS.length);

    for (let i = 0; i < EXPECTED_FINANCE_ROWS.length; i++) {
      const expected = EXPECTED_FINANCE_ROWS[i];
      const actual = transformed[i];

      expect(actual.invoice_number).toBe(expected.invoice);
      expect(actual.product_name).toBe(expected.product);
      expect(actual.quantity).toBe(expected.qty);
      expect(Number(actual.omzet)).toBe(expected.omzet);
      expect(Number(actual.hpp)).toBe(expected.hpp);
      expect(actual.platform_name).toBe(expected.platform);
      expect(actual.store_name).toBe(expected.store);
      expect(actual.admin_name).toBe(expected.admin);
      expect(actual.advertiser_name).toBe(expected.adv);
      expect(actual.payment_type).toBe(expected.payment);
    }
  });

  // MARKETING-specific tests
  it('should include correct Year and Month in MARKETING output', async () => {
    const transformed = await testDb('sales_transformed')
      .where({ session_id: testSessionId })
      .first();

    expect(transformed.year).toBe(2026);
    expect(transformed.month_name).toBe('Juni');
  });

  it('should map Region correctly', async () => {
    // Jawa Timur, Jawa Barat, Banten → JAWA
    const jawaRows = await testDb('sales_transformed')
      .where({ session_id: testSessionId })
      .whereIn('region', ['JAWA']);
    
    // At least the DAILY and PRODUK rows should have JAWA region
    expect(jawaRows.length).toBeGreaterThan(0);
  });
});
```

### 5. Unit Test — Promo Resolver

```typescript
// backend/tests/unit/resolvers/promo.resolver.test.ts
import { PromoResolver } from '../../../src/modules/transformation/resolvers/promo.resolver';

describe('PromoResolver', () => {
  const resolver = new PromoResolver();

  it('should return simple promo code as-is', () => {
    expect(resolver.extract('ZIP')).toBe('ZIP');
    expect(resolver.extract('ZP')).toBe('ZP');
    expect(resolver.extract('LED')).toBe('LED');
    expect(resolver.extract('DS')).toBe('DS');
  });

  it('should extract last segment from "/" pattern', () => {
    expect(resolver.extract('RN/CO/CODE')).toBe('CODE');
  });

  it('should handle two-segment "/" pattern', () => {
    expect(resolver.extract('RN/CO')).toBe('CO');
  });

  it('should return null for null input', () => {
    expect(resolver.extract(null)).toBeNull();
    expect(resolver.extract(undefined)).toBeNull();
  });

  it('should preserve space string', () => {
    expect(resolver.extract(' ')).toBe(' ');
  });

  it('should handle empty string', () => {
    expect(resolver.extract('')).toBe('');
  });
});
```

### 6. Unit Test — Date Resolver

```typescript
// backend/tests/unit/resolvers/date.resolver.test.ts
import { DateResolver } from '../../../src/modules/transformation/resolvers/date.resolver';

describe('DateResolver', () => {
  const resolver = new DateResolver();

  it('should format ISO date string', () => {
    const result = resolver.format('2026-06-08');
    expect(result.formatted).toBe('08/06/2026');
    expect(result.year).toBe(2026);
    expect(result.monthName).toBe('Juni');
  });

  it('should format Date object', () => {
    const result = resolver.format(new Date(2026, 5, 8)); // Month 0-indexed
    expect(result.formatted).toBe('08/06/2026');
    expect(result.monthName).toBe('Juni');
  });

  it('should throw for null date', () => {
    expect(() => resolver.format(null)).toThrow('Date is required');
  });

  it('should handle all month names in Indonesian', () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    for (let i = 0; i < 12; i++) {
      const result = resolver.format(new Date(2026, i, 1));
      expect(result.monthName).toBe(months[i]);
    }
  });
});
```

### 7. README.md Template

```markdown
# Sales Data Transformation System

Sistem fullstack untuk mengimport, memproses, dan mentransformasi data penjualan
dari 3 file Excel menjadi 2 file output (FINANCE & MARKETING) secara otomatis.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL 16
- **Queue**: BullMQ + Redis 7
- **Excel**: ExcelJS (streaming)

## Prerequisites

- Node.js >= 20 LTS
- PostgreSQL >= 14 (Running locally)
- Redis >= 6 (Running locally)
- Git

## Quick Start

### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd business-case-fullstack-engineer
\`\`\`

### 2. Start Infrastructure
Pastikan PostgreSQL dan Redis server sudah berjalan di local environment Anda dengan credentials default atau sesuai `.env`.

### 3. Setup Backend
\`\`\`bash
cd backend
cp .env.example .env
npm install
npx knex migrate:latest
npx knex seed:run
npm run dev
\`\`\`

### 4. Setup Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### 5. Access Application
- Frontend: http://localhost:5173
- API: http://localhost:3000/api/health

## Usage

1. Open http://localhost:5173
2. Navigate to "Upload" page
3. Drag & drop 3 Excel files (SALES DAILY, SALES MP, SALES PRODUK)
4. Click "Start Import"
5. Monitor progress in real-time
6. Download output files (FINANCE.XLSX, MARKETING.XLSX) from session detail

## Running Tests
\`\`\`bash
cd backend
npm test
\`\`\`

## Project Structure
[Include folder structure here]
```

### 8. PROBLEM.md Template

```markdown
# Kendala Teknis & Solusi

## 1. Format Tanggal Tidak Konsisten

**Masalah**: File SALES DAILY menggunakan format string "2026-06-08", sedangkan SALES MP
dan SALES PRODUK menggunakan JavaScript Date object dari ExcelJS parsing.

**Solusi**: Membuat DateResolver yang mendeteksi tipe input (string, Date object,
Excel serial number) dan mengkonversi ke format standar DD/MM/YYYY.

---

## 2. Bundle Product Memiliki Harga Berbeda per Output

**Masalah**: BDL01 (bundle) menghasilkan BOXL A + BOXL B dengan omzet yang
**berbeda antara FINANCE dan MARKETING output**:
- FINANCE: BOXL A = 175,000 | BOXL B = 93,000
- MARKETING: BOXL A = 190,000 | BOXL B = 90,000

**Solusi**: Membuat tabel `bundle_price_splits` yang menyimpan harga jual
per bundle item, per platform, dan per output type (FINANCE/MARKETING).

---

## 3. Kolom ADV Tidak Ada di SALES MP

**Masalah**: File SALES MP tidak memiliki kolom ADV (advertiser),
sedangkan output membutuhkan informasi advertiser.

**Solusi**: Resolve advertiser melalui store mapping. Setiap store memiliki
default advertiser yang di-assign melalui tabel `advertisers`.

---

## 4. Parsing Toko dengan Format "PLATFORM|nama"

**Masalah**: Kolom Toko di input menggunakan format inconsistent:
- "SC" (tanpa separator)
- "SHOPEE|raya" (dengan separator "|")
- "TIKTOK SHOP|TB" (dengan separator "|")

**Solusi**: Store resolver memeriksa tabel `stores` dengan field `source_toko`
yang menyimpan pattern asli. Matching dilakukan case-insensitive.

---

## 5. [Tambahkan kendala lain yang ditemukan saat implementasi]
```

### 9. Rollback Feature (Bonus/Add-On)

```typescript
// Rollback endpoint — menghapus semua data untuk session tertentu
// DELETE /api/import/sessions/:id/rollback

async rollbackSession(sessionId: string): Promise<void> {
  await TransactionManager.run(async (trx) => {
    // Delete in reverse dependency order
    await trx('sales_transformed').where({ session_id: sessionId }).delete();
    await trx('sales_raw').where({ session_id: sessionId }).delete();
    await trx('import_logs').where({ session_id: sessionId }).delete();
    
    // Update session status
    await trx('import_sessions')
      .where({ id: sessionId })
      .update({
        status: 'rolled_back',
        completed_at: new Date(),
      });

    // Delete output files
    const outputDir = path.resolve(process.cwd(), '../result');
    const files = [
      `FINANCE_${sessionId}.XLSX`,
      `MARKETING_${sessionId}.XLSX`,
    ];
    for (const file of files) {
      await fs.unlink(path.join(outputDir, file)).catch(() => {});
    }
  });
}
```

---

## Checklist

- [ ] Jest configuration untuk TypeScript
- [ ] Test database setup & teardown
- [ ] Full pipeline E2E test pass
- [ ] Upload validation tests pass
- [ ] All resolver unit tests pass (promo, date, platform, store, HPP, region)
- [ ] Output data matches expected FINANCE.XLSX
- [ ] Output data matches expected MARKETING.XLSX
- [ ] Error scenario tests pass (invalid files, missing columns)
- [ ] README.md lengkap dengan instruksi instalasi
- [ ] PROBLEM.md lengkap dengan kendala & solusi
- [ ] Output files di-generate ke folder `result/`
- [ ] Rollback feature berfungsi (bonus)
- [ ] Final UI review — no visual bugs
- [ ] All TypeScript compilation clean
- [ ] ESLint + Prettier pass

---

## Acceptance Criteria

1. ✅ `npm test` — semua test pass tanpa failure
2. ✅ Full pipeline: upload 3 files → 2 output files generated correctly
3. ✅ Output FINANCE.XLSX memiliki 8 data rows yang **match persis** dengan expected
4. ✅ Output MARKETING.XLSX memiliki 8 data rows yang **match persis** dengan expected
5. ✅ Bundle BDL01 di-expand dengan harga yang benar per output type
6. ✅ README.md: developer baru bisa setup project hanya dengan membaca README
7. ✅ PROBLEM.md: minimal 4 kendala teknis terdokumentasi
8. ✅ `cd backend && npm install && npx knex migrate:latest && npx knex seed:run && npm run dev` — berhasil berjalan dengan asumsi Postgres/Redis local sudah ready
9. ✅ Error log downloadable sebagai Excel file
10. ✅ Rollback session menghapus semua related data

---

## Catatan Best Practice

1. **Test Isolation**: Setiap test harus independent. Gunakan separate test database atau cleanup after each test
2. **Fixtures**: Gunakan file fixture yang kecil untuk test, bukan file production. Copy subset dari data asli
3. **Snapshot Testing**: Pertimbangkan snapshot test untuk output Excel — detect perubahan format yang tidak diinginkan
4. **CI/CD Ready**: Jest config harus bisa berjalan di CI environment (GitHub Actions). Pastikan Docker services tersedia
5. **Test Coverage**: Target minimal 80% line coverage untuk service layer dan resolvers
6. **README First**: README harus bisa diikuti oleh developer yang belum pernah melihat codebase
7. **PROBLEM.md**: Jujur dokumentasikan kendala. Ini menunjukkan kemampuan problem-solving, bukan kelemahan
8. **Diff Comparison**: Cara paling reliable untuk verify output accuracy adalah membandingkan cell-by-cell dengan expected output
