# Phase 3: Backend Core — Repository, Service, Controller, DTO

---

## Tujuan Fase

Membangun arsitektur backend core menggunakan **Clean Architecture** dengan pattern Repository → Service → Controller. Fase ini menghasilkan fondasi CRUD untuk master data, endpoint upload Excel, validation layer terhadap database rules, dan transaction management. Semua business logic berada di Service layer — Controller hanya orchestrate request/response.

---

## Scope Pekerjaan

1. Base classes: BaseRepository, BaseService, BaseController
2. Module structure per feature domain
3. Master data CRUD (products, platforms, stores, admins, regions, etc.)
4. Excel upload endpoint dengan Multer
5. File validation service (format, headers, size)
6. DTOs dengan Zod schema validation
7. Transaction management wrapper
8. API router configuration
9. Logging service integration

---

## Requirement

### Prerequisite

- Phase 1 selesai (Express server running)
- Phase 2 selesai (Database migrated & seeded)
- Koneksi database tervalidasi

### Architecture Principles

```
HTTP Request
    │
    ▼
┌────────────────┐
│   Controller   │  ← Hanya handle req/res, validation input
│   (Route)      │
└────────┬───────┘
         │ DTO (validated)
         ▼
┌────────────────┐
│    Service     │  ← Business logic, orchestration
│    Layer       │
└────────┬───────┘
         │ Entity/Model
         ▼
┌────────────────┐
│  Repository    │  ← Database access, query builder
│   Layer        │
└────────┬───────┘
         │ SQL
         ▼
┌────────────────┐
│  PostgreSQL    │
└────────────────┘
```

---

## Struktur Folder yang Dihasilkan

```
backend/src/
├── modules/
│   ├── shared/
│   │   ├── base.repository.ts         # Abstract base repository
│   │   ├── base.service.ts            # Abstract base service
│   │   ├── base.controller.ts         # Abstract base controller
│   │   ├── transaction.manager.ts     # DB transaction wrapper
│   │   └── dto/
│   │       ├── pagination.dto.ts      # Pagination input/output
│   │       └── api-response.dto.ts    # Standard API response
│   │
│   ├── platform/
│   │   ├── platform.repository.ts
│   │   ├── platform.service.ts
│   │   ├── platform.controller.ts
│   │   ├── platform.routes.ts
│   │   └── dto/
│   │       ├── create-platform.dto.ts
│   │       └── update-platform.dto.ts
│   │
│   ├── product/
│   │   ├── product.repository.ts
│   │   ├── product.service.ts
│   │   ├── product.controller.ts
│   │   ├── product.routes.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       └── update-product.dto.ts
│   │
│   ├── store/
│   │   ├── store.repository.ts
│   │   ├── store.service.ts
│   │   ├── store.controller.ts
│   │   ├── store.routes.ts
│   │   └── dto/
│   │
│   ├── admin/
│   │   ├── admin.repository.ts
│   │   ├── admin.service.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.routes.ts
│   │   └── dto/
│   │
│   ├── region/
│   │   ├── region.repository.ts
│   │   ├── region.service.ts
│   │   ├── region.controller.ts
│   │   ├── region.routes.ts
│   │   └── dto/
│   │
│   ├── advertiser/
│   │   ├── advertiser.repository.ts
│   │   ├── advertiser.service.ts
│   │   ├── advertiser.controller.ts
│   │   ├── advertiser.routes.ts
│   │   └── dto/
│   │
│   ├── price-rule/
│   │   ├── price-rule.repository.ts
│   │   ├── price-rule.service.ts
│   │   ├── price-rule.controller.ts
│   │   ├── price-rule.routes.ts
│   │   └── dto/
│   │
│   ├── column-mapping/
│   │   ├── column-mapping.repository.ts
│   │   ├── column-mapping.service.ts
│   │   ├── column-mapping.controller.ts
│   │   ├── column-mapping.routes.ts
│   │   └── dto/
│   │
│   ├── import/
│   │   ├── import.repository.ts        # import_sessions + import_logs queries
│   │   ├── import.service.ts           # Upload orchestration
│   │   ├── import.controller.ts        # Upload endpoint
│   │   ├── import.routes.ts
│   │   ├── file-validator.service.ts   # Excel file validation
│   │   ├── excel-reader.service.ts     # Streaming Excel reader
│   │   └── dto/
│   │       ├── upload.dto.ts
│   │       └── import-session.dto.ts
│   │
│   └── sales/
│       ├── sales-raw.repository.ts
│       ├── sales-transformed.repository.ts
│       └── dto/
│           ├── sales-raw.dto.ts
│           └── sales-transformed.dto.ts
│
├── routes/
│   └── index.ts                        # Central router registration
│
└── services/
    └── logger.service.ts               # Winston logger singleton
```

---

## Daftar File yang Harus Dibuat

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `modules/shared/base.repository.ts` | Generic CRUD methods dengan Knex |
| 2 | `modules/shared/base.service.ts` | Common service patterns |
| 3 | `modules/shared/base.controller.ts` | Request handling helpers |
| 4 | `modules/shared/transaction.manager.ts` | Knex transaction wrapper |
| 5 | `modules/shared/dto/pagination.dto.ts` | Zod schema untuk pagination |
| 6 | `modules/shared/dto/api-response.dto.ts` | Standard response wrapper |
| 7-12 | `modules/platform/*.ts` | Platform CRUD module |
| 13-18 | `modules/product/*.ts` | Product CRUD module |
| 19-24 | `modules/store/*.ts` | Store CRUD module |
| 25-28 | `modules/admin/*.ts` | Admin CRUD module |
| 29-32 | `modules/region/*.ts` | Region CRUD module |
| 33-36 | `modules/advertiser/*.ts` | Advertiser CRUD module |
| 37-40 | `modules/price-rule/*.ts` | Price Rule CRUD module |
| 41-44 | `modules/column-mapping/*.ts` | Column Mapping CRUD module |
| 45-51 | `modules/import/*.ts` | Import module (upload, validate, read) |
| 52-55 | `modules/sales/*.ts` | Sales data repositories |
| 56 | `routes/index.ts` | Central router |
| 57 | `services/logger.service.ts` | Winston logger |

---

## Penjelasan Teknis

### 1. Base Repository Pattern

```typescript
// modules/shared/base.repository.ts
import { Knex } from 'knex';
import db from '../../config/database';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly tableName: string,
    protected readonly knex: Knex = db
  ) {}

  async findAll(options?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ data: T[]; total: number }> {
    const { page = 1, limit = 20, orderBy = 'id', order = 'asc' } = options || {};
    const offset = (page - 1) * limit;

    const [data, [{ count }]] = await Promise.all([
      this.knex(this.tableName)
        .orderBy(orderBy, order)
        .limit(limit)
        .offset(offset),
      this.knex(this.tableName).count('* as count'),
    ]);

    return { data: data as T[], total: Number(count) };
  }

  async findById(id: number | string): Promise<T | null> {
    const row = await this.knex(this.tableName).where({ id }).first();
    return (row as T) || null;
  }

  async create(data: Partial<T>, trx?: Knex.Transaction): Promise<T> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const [result] = await query.insert(data).returning('*');
    return result as T;
  }

  async bulkCreate(data: Partial<T>[], trx?: Knex.Transaction): Promise<T[]> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const results = await query.insert(data).returning('*');
    return results as T[];
  }

  async update(id: number | string, data: Partial<T>, trx?: Knex.Transaction): Promise<T> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const [result] = await query.where({ id }).update(data).returning('*');
    return result as T;
  }

  async delete(id: number | string, trx?: Knex.Transaction): Promise<boolean> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const count = await query.where({ id }).delete();
    return count > 0;
  }

  async upsert(
    data: Partial<T>,
    conflictColumns: string[],
    trx?: Knex.Transaction
  ): Promise<T> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const [result] = await query
      .insert(data)
      .onConflict(conflictColumns)
      .merge()
      .returning('*');
    return result as T;
  }
}
```

### 2. Transaction Manager

```typescript
// modules/shared/transaction.manager.ts
import { Knex } from 'knex';
import db from '../../config/database';

export class TransactionManager {
  static async run<T>(
    callback: (trx: Knex.Transaction) => Promise<T>
  ): Promise<T> {
    const trx = await db.transaction();
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
```

### 3. DTO Pattern dengan Zod

```typescript
// modules/import/dto/upload.dto.ts
import { z } from 'zod';

export const UploadFilesSchema = z.object({
  files: z.array(z.object({
    originalname: z.string(),
    mimetype: z.string().refine(
      (m) => [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(m),
      { message: 'Only Excel files are allowed' }
    ),
    size: z.number().max(50 * 1024 * 1024, 'File too large (max 50MB)'),
    path: z.string(),
  })).min(3, 'Exactly 3 files required').max(3, 'Exactly 3 files required'),
});

export type UploadFilesDTO = z.infer<typeof UploadFilesSchema>;
```

### 4. File Validator Service

```typescript
// modules/import/file-validator.service.ts
import ExcelJS from 'exceljs';
import { ColumnMappingRepository } from '../column-mapping/column-mapping.repository';

export class FileValidatorService {
  constructor(
    private columnMappingRepo: ColumnMappingRepository
  ) {}

  /**
   * Mendeteksi tipe file berdasarkan kolom header
   * DAILY: memiliki 'Warehouse' dan 'Status Order'
   * MP: memiliki 'City' dan 'Province' (bukan 'ProvinsiCustomer')
   * PRODUK: memiliki 'ProvinsiCustomer' tapi TIDAK ada 'Warehouse'
   */
  async detectFileType(filePath: string): Promise<'DAILY' | 'MP' | 'PRODUK'> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as string[];

    if (headers.includes('Warehouse') && headers.includes('Status Order')) {
      return 'DAILY';
    }
    if (headers.includes('City') && headers.includes('Province')) {
      return 'MP';
    }
    return 'PRODUK';
  }

  /**
   * Validasi bahwa kolom di file cocok dengan mapping di database
   */
  async validateHeaders(
    filePath: string,
    fileType: 'DAILY' | 'MP' | 'PRODUK'
  ): Promise<{ valid: boolean; errors: string[] }> {
    const mappings = await this.columnMappingRepo.findByFileType(fileType);
    const expectedColumns = mappings.map(m => m.source_column);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1);
    const actualHeaders = (headerRow.values as string[]).filter(Boolean);

    const errors: string[] = [];
    for (const expected of expectedColumns) {
      if (!actualHeaders.includes(expected)) {
        errors.push(`Missing column: ${expected}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
```

### 5. Excel Streaming Reader

```typescript
// modules/import/excel-reader.service.ts
import ExcelJS from 'exceljs';
import { EventEmitter } from 'events';

export interface ExcelRow {
  rowNumber: number;
  data: Record<string, unknown>;
}

export class ExcelReaderService extends EventEmitter {
  private readonly CHUNK_SIZE = 100;

  /**
   * Streaming reader — tidak load seluruh file ke memory
   * Emit events: 'row', 'chunk', 'end', 'error'
   */
  async readFileStreaming(
    filePath: string,
    columnMappings: Map<string, string> // sourceColumn → internalField
  ): Promise<void> {
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      worksheets: 'emit',
    });

    let headers: string[] = [];
    let chunk: ExcelRow[] = [];
    let rowCount = 0;

    for await (const worksheetReader of workbook) {
      for await (const row of worksheetReader) {
        if (row.number === 1) {
          // Header row
          headers = (row.values as any[]).slice(1).map(String);
          continue;
        }

        rowCount++;
        const values = (row.values as any[]).slice(1);
        const mappedRow: Record<string, unknown> = {};

        headers.forEach((header, index) => {
          const internalField = columnMappings.get(header);
          if (internalField) {
            mappedRow[internalField] = values[index] ?? null;
          }
        });

        const excelRow: ExcelRow = { rowNumber: row.number, data: mappedRow };
        this.emit('row', excelRow);
        chunk.push(excelRow);

        if (chunk.length >= this.CHUNK_SIZE) {
          this.emit('chunk', [...chunk]);
          chunk = [];
        }
      }
    }

    // Emit remaining rows
    if (chunk.length > 0) {
      this.emit('chunk', [...chunk]);
    }

    this.emit('end', { totalRows: rowCount });
  }
}
```

### 6. Import Controller

```typescript
// modules/import/import.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ImportService } from './import.service';
import { uploadExcel } from '../../middleware/uploadHandler';

export class ImportController {
  constructor(private importService: ImportService) {}

  /**
   * POST /api/import/upload
   * Upload 3 Excel files dan mulai proses import
   */
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length !== 3) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_FILES', message: 'Exactly 3 Excel files required' }
        });
        return;
      }

      // Create import session dan dispatch ke queue
      const session = await this.importService.initiateImport(files);

      res.status(202).json({
        success: true,
        data: {
          sessionId: session.id,
          status: session.status,
          message: 'Import initiated. Track progress via SSE.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/import/sessions
   * List semua import sessions
   */
  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await this.importService.getSessions({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/import/sessions/:id
   * Detail satu import session
   */
  async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await this.importService.getSessionById(req.params.id);
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/import/sessions/:id/logs
   * Download error logs untuk session tertentu
   */
  async getSessionLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { level } = req.query;
      const logs = await this.importService.getSessionLogs(
        req.params.id,
        level as string
      );
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/import/sessions/:id/logs/download
   * Download error log sebagai file
   */
  async downloadLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buffer = await this.importService.generateLogFile(req.params.id);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=error_log_${req.params.id}.xlsx`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}
```

### 7. Central Router Pattern

```typescript
// routes/index.ts
import { Router } from 'express';
import { platformRoutes } from '../modules/platform/platform.routes';
import { productRoutes } from '../modules/product/product.routes';
import { storeRoutes } from '../modules/store/store.routes';
import { adminRoutes } from '../modules/admin/admin.routes';
import { regionRoutes } from '../modules/region/region.routes';
import { advertiserRoutes } from '../modules/advertiser/advertiser.routes';
import { priceRuleRoutes } from '../modules/price-rule/price-rule.routes';
import { columnMappingRoutes } from '../modules/column-mapping/column-mapping.routes';
import { importRoutes } from '../modules/import/import.routes';

const router = Router();

router.use('/platforms', platformRoutes);
router.use('/products', productRoutes);
router.use('/stores', storeRoutes);
router.use('/admins', adminRoutes);
router.use('/regions', regionRoutes);
router.use('/advertisers', advertiserRoutes);
router.use('/price-rules', priceRuleRoutes);
router.use('/column-mappings', columnMappingRoutes);
router.use('/import', importRoutes);

export default router;

// Di app.ts:
// app.use('/api', router);
```

### 8. API Endpoint Summary

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/import/upload` | Upload 3 Excel files |
| GET | `/api/import/sessions` | List import sessions |
| GET | `/api/import/sessions/:id` | Detail session |
| GET | `/api/import/sessions/:id/logs` | Session logs |
| GET | `/api/import/sessions/:id/logs/download` | Download error log |
| GET | `/api/import/sessions/:id/output/:type` | Download output file (FINANCE/MARKETING) |
| CRUD | `/api/platforms` | Platform master |
| CRUD | `/api/products` | Product master |
| CRUD | `/api/stores` | Store master |
| CRUD | `/api/admins` | Admin master |
| CRUD | `/api/regions` | Region master |
| CRUD | `/api/advertisers` | Advertiser master |
| CRUD | `/api/price-rules` | Price rules |
| CRUD | `/api/column-mappings` | Column mappings |

---

## Checklist

- [ ] Base repository dengan CRUD methods + transaction support
- [ ] Base controller dengan error handling
- [ ] Transaction manager berfungsi (commit & rollback)
- [ ] Zod DTO validation menolak input invalid
- [ ] Setiap module memiliki repository, service, controller, routes, dto
- [ ] Platform CRUD endpoint berfungsi
- [ ] Product CRUD endpoint berfungsi (termasuk bundle)
- [ ] Store CRUD endpoint berfungsi
- [ ] Import upload endpoint menerima 3 file Excel
- [ ] File type detection berfungsi (DAILY, MP, PRODUK)
- [ ] Header validation terhadap database column_mappings
- [ ] Excel streaming reader berfungsi per chunk
- [ ] Error response terformat konsisten
- [ ] Logger menulis ke file untuk level error
- [ ] Central router menggabungkan semua module routes

---

## Acceptance Criteria

1. ✅ `POST /api/import/upload` dengan 3 file Excel valid → return 202 dengan sessionId
2. ✅ `POST /api/import/upload` dengan 2 file → return 400 error
3. ✅ `POST /api/import/upload` dengan file PDF → return 400 error
4. ✅ `GET /api/platforms` → return list platform dari database
5. ✅ `POST /api/platforms` dengan data valid → create new platform
6. ✅ `POST /api/platforms` dengan data duplikat → return 409 conflict
7. ✅ File type auto-detection benar untuk ketiga file input
8. ✅ Column header validation error jika file memiliki kolom yang salah
9. ✅ Excel streaming reader emit rows tanpa loading seluruh file ke memory
10. ✅ Transaction rollback jika ada error di tengah batch insert

---

## Catatan Best Practice

1. **Dependency Injection**: Inject repository ke service melalui constructor. Ini memudahkan unit testing dengan mock
2. **Controller Thin**: Controller hanya handle HTTP concerns (parse request, send response). Jangan taruh business logic di controller
3. **Error Boundaries**: Setiap controller method harus wrap dalam try-catch dan forward ke next(error)
4. **Zod Parse**: Gunakan `schema.parse()` (throw error) bukan `schema.safeParse()` — biarkan global error handler yang menangani ZodError
5. **Streaming vs Loading**: SELALU gunakan ExcelJS streaming reader (`stream.xlsx.WorkbookReader`) untuk file input. `workbook.xlsx.readFile()` hanya untuk file kecil (master data)
6. **Response Consistency**: Semua response harus mengikuti format `{ success: boolean, data?: T, error?: { code, message, details } }`
7. **Status Codes**: 200 (OK), 201 (Created), 202 (Accepted/async), 400 (Bad Request), 404 (Not Found), 409 (Conflict), 500 (Internal)
8. **Bulk Operations**: Gunakan `bulkCreate()` dengan transaction untuk insert banyak rows sekaligus, bukan loop insert satu per satu
