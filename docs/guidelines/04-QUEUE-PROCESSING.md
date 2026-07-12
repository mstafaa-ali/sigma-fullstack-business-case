# Phase 4: Queue Processing — BullMQ Workers & Job Pipeline

---

## Tujuan Fase

Mengimplementasikan sistem antrian (queue) menggunakan **BullMQ + Redis** untuk memproses import Excel secara asynchronous. Setiap file diproses melalui pipeline jobs yang terdiri dari validasi → parsing → insert ke database. Progress dilaporkan secara real-time melalui **Server-Sent Events (SSE)**. Sistem mendukung retry, error recovery, dan dead letter queue.

---

## Scope Pekerjaan

1. BullMQ queue dan worker configuration
2. Job pipeline: ValidateJob → ParseJob → InsertJob
3. Progress tracking via Redis Pub/Sub
4. SSE endpoint untuk real-time progress
5. Retry logic dan dead letter queue
6. Job event listeners (completed, failed, progress)
7. Graceful shutdown untuk workers

---

## Requirement

### Prerequisite

- Phase 1 selesai (Redis running via Docker Compose)
- Phase 3 selesai (Import service dan Excel reader tersedia)
- IORedis terkoneksi

### Import Job Pipeline

```
Upload Request (Controller)
        │
        ▼
┌──────────────────┐
│ Create Session   │  ← Status: 'pending'
│ (Synchronous)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ VALIDATE_FILES   │  ← Status: 'validating'
│ Job (Queue)      │  ← Detect file types, validate headers
└────────┬─────────┘
         │ (on complete)
         ▼
┌──────────────────┐
│ PARSE_AND_INSERT │  ← Status: 'processing'
│ Job (Queue)      │  ← Stream read, map columns, bulk insert
│ Per file (3x)    │     ke sales_raw per chunk
└────────┬─────────┘
         │ (all 3 complete)
         ▼
┌──────────────────┐
│ TRANSFORM_DATA   │  ← Status: 'transforming'
│ Job (Queue)      │  ← Business logic transformation
└────────┬─────────┘     (akan di-implementasi di Phase 5)
         │ (on complete)
         ▼
┌──────────────────┐
│ GENERATE_OUTPUT  │  ← Status: 'generating'
│ Job (Queue)      │  ← Create FINANCE.XLSX & MARKETING.XLSX
└────────┬─────────┘     (akan di-implementasi di Phase 5)
         │ (on complete)
         ▼
   Status: 'completed'
```

---

## Struktur Folder yang Dihasilkan

```
backend/src/
├── queues/
│   ├── index.ts                    # Queue registry & initialization
│   ├── queue.constants.ts          # Queue names, job options
│   ├── import.queue.ts             # Import queue definition
│   └── events/
│       └── queue-event.handler.ts  # Global queue event listeners
│
├── workers/
│   ├── index.ts                    # Worker registry & startup
│   ├── validate-files.worker.ts    # File validation worker
│   ├── parse-insert.worker.ts      # Parse Excel & insert to DB worker
│   ├── transform-data.worker.ts    # Placeholder (Phase 5)
│   └── generate-output.worker.ts   # Placeholder (Phase 5)
│
├── modules/
│   └── import/
│       ├── import.service.ts       # Update: dispatch jobs ke queue
│       └── sse/
│           ├── sse.controller.ts   # SSE endpoint
│           ├── sse.service.ts      # Redis Pub/Sub → SSE stream
│           └── progress.types.ts   # Progress event types
│
└── config/
    ├── queue.ts                    # Update: BullMQ connection options
    └── redis.ts                    # Update: separate pub/sub connections
```

---

## Daftar File yang Harus Dibuat

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `queues/queue.constants.ts` | Queue names, default job options |
| 2 | `queues/index.ts` | Queue initialization & registry |
| 3 | `queues/import.queue.ts` | Import queue dengan Flow producer |
| 4 | `queues/events/queue-event.handler.ts` | Global event listeners |
| 5 | `workers/index.ts` | Worker initialization |
| 6 | `workers/validate-files.worker.ts` | File validation worker |
| 7 | `workers/parse-insert.worker.ts` | Parse & insert worker |
| 8 | `workers/transform-data.worker.ts` | Placeholder worker |
| 9 | `workers/generate-output.worker.ts` | Placeholder worker |
| 10 | `modules/import/sse/progress.types.ts` | SSE event type definitions |
| 11 | `modules/import/sse/sse.service.ts` | Redis Pub/Sub → SSE |
| 12 | `modules/import/sse/sse.controller.ts` | SSE endpoint |
| 13 | Update: `modules/import/import.service.ts` | Add queue dispatch |
| 14 | Update: `modules/import/import.routes.ts` | Add SSE route |
| 15 | Update: `config/redis.ts` | Add pub/sub connections |
| 16 | Update: `src/index.ts` | Start workers on boot |

---

## Penjelasan Teknis

### 1. Queue Constants

```typescript
// queues/queue.constants.ts
export const QUEUE_NAMES = {
  IMPORT: 'import-processing',
} as const;

export const JOB_NAMES = {
  VALIDATE_FILES: 'validate-files',
  PARSE_INSERT: 'parse-and-insert',
  TRANSFORM_DATA: 'transform-data',
  GENERATE_OUTPUT: 'generate-output',
} as const;

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000, // 2s, 4s, 8s
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24h
    count: 100,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
  },
};
```

### 2. Import Queue dengan Flow Producer

```typescript
// queues/import.queue.ts
import { Queue, FlowProducer } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS } from './queue.constants';

export const importQueue = new Queue(QUEUE_NAMES.IMPORT, {
  connection: redisConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const flowProducer = new FlowProducer({
  connection: redisConnection,
});

/**
 * Membuat flow job untuk import pipeline
 * Flow: validate → parse (3 parallel) → transform → generate
 */
export async function createImportFlow(sessionId: string, files: {
  path: string;
  originalname: string;
  fileType: 'DAILY' | 'MP' | 'PRODUK';
}[]) {
  // Step 1: Create the validate job
  await importQueue.add('validate-files', {
    sessionId,
    files,
  }, {
    jobId: `validate-${sessionId}`,
    ...DEFAULT_JOB_OPTIONS,
  });
}
```

### 3. Validate Files Worker

```typescript
// workers/validate-files.worker.ts
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import { FileValidatorService } from '../modules/import/file-validator.service';
import { ImportRepository } from '../modules/import/import.repository';
import { publishProgress } from '../modules/import/sse/sse.service';

interface ValidateJobData {
  sessionId: string;
  files: { path: string; originalname: string; fileType: string }[];
}

const worker = new Worker(
  QUEUE_NAMES.IMPORT,
  async (job: Job<ValidateJobData>) => {
    if (job.name !== JOB_NAMES.VALIDATE_FILES) return;

    const { sessionId, files } = job.data;
    const validator = new FileValidatorService(/* inject deps */);
    const importRepo = new ImportRepository();

    // Update session status
    await importRepo.updateSession(sessionId, { status: 'validating' });
    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'validating',
      message: 'Validating uploaded files...',
    });

    const validationErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update progress
      await job.updateProgress({
        step: 'validating',
        current: i + 1,
        total: files.length,
        file: file.originalname,
      });

      await publishProgress(sessionId, {
        type: 'progress',
        step: 'validating',
        current: i + 1,
        total: files.length,
        message: `Validating ${file.originalname}...`,
      });

      // Detect file type
      const detectedType = await validator.detectFileType(file.path);
      file.fileType = detectedType;

      // Validate headers
      const validation = await validator.validateHeaders(file.path, detectedType);
      if (!validation.valid) {
        validationErrors.push(
          ...validation.errors.map(e => `${file.originalname}: ${e}`)
        );
      }
    }

    if (validationErrors.length > 0) {
      await importRepo.updateSession(sessionId, { status: 'failed' });
      await publishProgress(sessionId, {
        type: 'error',
        message: 'Validation failed',
        errors: validationErrors,
      });
      throw new Error(`Validation failed: ${validationErrors.join('; ')}`);
    }

    // Dispatch parse jobs for each file
    const { importQueue } = require('../queues/import.queue');
    for (const file of files) {
      await importQueue.add(JOB_NAMES.PARSE_INSERT, {
        sessionId,
        filePath: file.path,
        fileName: file.originalname,
        fileType: file.fileType,
      });
    }

    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'processing',
      message: 'Starting file processing...',
    });

    return { validatedFiles: files };
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

export default worker;
```

### 4. Parse & Insert Worker

```typescript
// workers/parse-insert.worker.ts
import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import { ExcelReaderService } from '../modules/import/excel-reader.service';
import { SalesRawRepository } from '../modules/sales/sales-raw.repository';
import { ColumnMappingRepository } from '../modules/column-mapping/column-mapping.repository';
import { ImportRepository } from '../modules/import/import.repository';
import { TransactionManager } from '../modules/shared/transaction.manager';
import { publishProgress } from '../modules/import/sse/sse.service';

interface ParseJobData {
  sessionId: string;
  filePath: string;
  fileName: string;
  fileType: 'DAILY' | 'MP' | 'PRODUK';
}

const CHUNK_SIZE = 100;

const worker = new Worker(
  QUEUE_NAMES.IMPORT,
  async (job: Job<ParseJobData>) => {
    if (job.name !== JOB_NAMES.PARSE_INSERT) return;

    const { sessionId, filePath, fileName, fileType } = job.data;
    const importRepo = new ImportRepository();
    const salesRawRepo = new SalesRawRepository();
    const columnMappingRepo = new ColumnMappingRepository();

    await importRepo.updateSession(sessionId, { status: 'processing' });

    // Load column mappings from database
    const mappings = await columnMappingRepo.findByFileType(fileType);
    const columnMap = new Map(
      mappings.map(m => [m.source_column, m.internal_field])
    );

    const reader = new ExcelReaderService();
    let processedRows = 0;
    let errorRows = 0;

    reader.on('chunk', async (chunk) => {
      try {
        await TransactionManager.run(async (trx) => {
          const rows = chunk.map((row: any) => ({
            session_id: sessionId,
            file_type: fileType,
            row_number: row.rowNumber,
            ...row.data,
            raw_data: JSON.stringify(row.data),
            status: 'pending',
          }));

          // Bulk insert with upsert
          await salesRawRepo.bulkUpsert(rows, trx);
        });

        processedRows += chunk.length;

        await publishProgress(sessionId, {
          type: 'progress',
          step: 'processing',
          file: fileName,
          processedRows,
          message: `Processed ${processedRows} rows from ${fileName}`,
        });

        await job.updateProgress({ processedRows, file: fileName });
      } catch (error: any) {
        errorRows += chunk.length;
        await importRepo.createLog({
          session_id: sessionId,
          file_name: fileName,
          row_number: chunk[0]?.rowNumber || 0,
          log_level: 'error',
          message: `Chunk insert failed: ${error.message}`,
          raw_data: JSON.stringify(chunk),
        });
      }
    });

    await reader.readFileStreaming(filePath, columnMap);

    // Update session counters
    await importRepo.incrementSessionCounters(sessionId, {
      processed_rows: processedRows,
      error_rows: errorRows,
    });

    // Check if all 3 files are done
    const pendingJobs = await importQueue.getWaiting();
    const activeJobs = await importQueue.getActive();
    const parseJobs = [...pendingJobs, ...activeJobs].filter(
      j => j.name === JOB_NAMES.PARSE_INSERT && j.data.sessionId === sessionId
    );

    if (parseJobs.length === 0) {
      // All files processed — dispatch transform job
      await importQueue.add(JOB_NAMES.TRANSFORM_DATA, { sessionId });
    }

    return { processedRows, errorRows, fileName };
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process 3 files in parallel
  }
);

export default worker;
```

### 5. SSE (Server-Sent Events) Service

```typescript
// modules/import/sse/sse.service.ts
import Redis from 'ioredis';
import { redisConfig } from '../../../config/redis';

const publisher = new Redis(redisConfig);
const CHANNEL_PREFIX = 'import:progress:';

export interface ProgressEvent {
  type: 'status_change' | 'progress' | 'error' | 'completed';
  status?: string;
  step?: string;
  current?: number;
  total?: number;
  processedRows?: number;
  file?: string;
  message: string;
  errors?: string[];
  timestamp?: string;
}

/**
 * Publish progress event ke Redis channel
 */
export async function publishProgress(
  sessionId: string,
  event: ProgressEvent
): Promise<void> {
  event.timestamp = new Date().toISOString();
  await publisher.publish(
    `${CHANNEL_PREFIX}${sessionId}`,
    JSON.stringify(event)
  );
}
```

### 6. SSE Controller

```typescript
// modules/import/sse/sse.controller.ts
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { redisConfig } from '../../../config/redis';

const CHANNEL_PREFIX = 'import:progress:';

/**
 * GET /api/import/sessions/:id/progress
 * SSE endpoint untuk real-time progress tracking
 */
export function streamProgress(req: Request, res: Response): void {
  const { id: sessionId } = req.params;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx compatibility
  res.flushHeaders();

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ sessionId })}\n\n`);

  // Subscribe to Redis channel
  const subscriber = new Redis(redisConfig);
  const channel = `${CHANNEL_PREFIX}${sessionId}`;

  subscriber.subscribe(channel, (err) => {
    if (err) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Subscribe failed' })}\n\n`);
      return;
    }
  });

  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      const event = JSON.parse(message);
      res.write(`event: ${event.type}\ndata: ${message}\n\n`);

      // Auto-close on completion or failure
      if (event.type === 'completed' || event.status === 'failed') {
        setTimeout(() => {
          res.write(`event: close\ndata: {}\n\n`);
          res.end();
          subscriber.unsubscribe(channel);
          subscriber.quit();
        }, 1000);
      }
    }
  });

  // Cleanup on client disconnect
  req.on('close', () => {
    subscriber.unsubscribe(channel);
    subscriber.quit();
  });
}
```

### 7. Retry dan Error Handling Strategy

```typescript
// Retry configuration per job type
const RETRY_CONFIGS = {
  [JOB_NAMES.VALIDATE_FILES]: {
    attempts: 2,      // Validation jarang perlu retry
    backoff: { type: 'fixed', delay: 1000 },
  },
  [JOB_NAMES.PARSE_INSERT]: {
    attempts: 3,      // Parse bisa gagal karena DB connection
    backoff: { type: 'exponential', delay: 2000 },
  },
  [JOB_NAMES.TRANSFORM_DATA]: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
  },
  [JOB_NAMES.GENERATE_OUTPUT]: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
  },
};

// Dead letter queue untuk jobs yang gagal setelah semua retry
// BullMQ otomatis memindahkan ke 'failed' state
// Log error detail ke import_logs table
```

### 8. Graceful Shutdown

```typescript
// src/index.ts (update)
import { importWorkers } from './workers';
import { importQueue } from './queues/import.queue';

async function gracefulShutdown() {
  console.log('Shutting down gracefully...');

  // Close all workers first (finish current job)
  await Promise.all(
    importWorkers.map(w => w.close())
  );

  // Close queues
  await importQueue.close();

  // Close DB connection
  await db.destroy();

  // Close Redis
  await redis.quit();

  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

---

## Checklist

- [ ] BullMQ queue terkoneksi ke Redis
- [ ] Validate worker memproses file validation
- [ ] Parse worker streaming read + bulk insert ke sales_raw
- [ ] Progress events ter-publish ke Redis
- [ ] SSE endpoint mengirim progress ke client
- [ ] Retry logic berfungsi (test dengan DB disconnect temporary)
- [ ] Error logs tercatat di import_logs table
- [ ] Session status terupdate di setiap step
- [ ] Graceful shutdown menutup semua koneksi
- [ ] Multiple imports tidak saling mengganggu (isolated sessions)
- [ ] Worker concurrency sesuai konfigurasi
- [ ] Job cleanup otomatis (removeOnComplete/removeOnFail)

---

## Acceptance Criteria

1. ✅ Upload 3 file → validate job dispatch otomatis
2. ✅ Validation pass → 3 parse jobs dispatch (1 per file)
3. ✅ Parse jobs insert data ke `sales_raw` dalam chunks
4. ✅ SSE endpoint mengirim progress events secara real-time
5. ✅ Browser `EventSource` menerima events (test dengan curl):
   ```bash
   curl -N http://localhost:3000/api/import/sessions/{id}/progress
   ```
6. ✅ Job retry berfungsi saat terjadi transient error
7. ✅ Failed job tercatat di import_logs dengan detail error
8. ✅ Session status berubah: pending → validating → processing → (ready for transform)
9. ✅ Graceful shutdown menunggu active job selesai sebelum exit
10. ✅ Menjalankan 2 import bersamaan → keduanya berjalan paralel tanpa conflict

---

## Catatan Best Practice

1. **Separate Redis Connections**: BullMQ membutuhkan connection terpisah untuk Queue, Worker, dan QueueEvents. Jangan share satu connection
2. **Sandboxed Workers**: Untuk production, pertimbangkan menjalankan worker di proses terpisah. BullMQ mendukung `sandboxedProcess` option
3. **Idempotent Jobs**: Setiap job harus idempotent — safe di-run ulang tanpa side effects (gunakan upsert, bukan insert)
4. **Memory Management**: Jangan simpan data besar di job.data. Simpan di database/file, pass reference (sessionId, filePath) saja
5. **Progress Granularity**: Report progress per chunk, bukan per row. Terlalu banyak progress event membebani Redis
6. **SSE Heartbeat**: Kirim heartbeat event setiap 15 detik untuk mencegah proxy/load balancer menutup koneksi idle
7. **Backpressure**: Jika chunk processing lebih lambat dari reading, implementasi backpressure agar memory tidak overflow
8. **Queue Dashboard**: Pertimbangkan @bull-board/express untuk monitoring queue di development
