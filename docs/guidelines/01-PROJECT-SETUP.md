# Phase 1: Project Setup & Scaffolding

---

## Tujuan Fase

Membangun fondasi project dengan arsitektur enterprise-grade menggunakan **Node.js (Express + TypeScript)** untuk backend, **React (Vite + TypeScript)** untuk frontend, **PostgreSQL** untuk database, dan **Redis + BullMQ** untuk queue system. Seluruh konfigurasi, linting, dan Docker Compose harus siap digunakan pada akhir fase ini.

---

## Alasan Pemilihan Tech Stack

### Node.js (Express + TypeScript) vs Laravel

1. **TypeScript end-to-end**: Satu bahasa (TypeScript) untuk frontend dan backend mengurangi context switching dan memungkinkan shared types/DTOs
2. **Streaming Excel yang superior**: Library `exceljs` di Node.js mendukung streaming reader secara native, critical untuk file besar tanpa memory overflow
3. **Non-blocking I/O native**: Node.js event loop ideal untuk operasi I/O-heavy seperti file processing + database writes secara concurrent
4. **BullMQ ecosystem**: BullMQ terintegrasi seamless dengan Node.js, mendukung rate limiting, sandboxed processors, dan flow jobs yang lebih powerful dari Laravel Queue
5. **Real-time communication**: Native WebSocket/SSE support tanpa overhead package tambahan seperti Laravel Echo + Pusher

### PostgreSQL vs MySQL

1. **UPSERT native**: `ON CONFLICT DO UPDATE` lebih mature dan performa lebih baik dari MySQL `ON DUPLICATE KEY UPDATE`, critical untuk re-import logic
2. **JSON/JSONB support**: Menyimpan flexible mapping rules dan error details dalam format terstruktur
3. **Partial indexes**: Memungkinkan index pada subset data (contoh: hanya rows dengan status tertentu), menghemat storage dan mempercepat query
4. **CTE (Common Table Expressions)**: Complex transformation queries lebih readable dan maintainable
5. **ENUM type native**: Mendukung domain types langsung di database level
6. **Better concurrency**: MVCC implementation PostgreSQL lebih robust untuk concurrent writes dari queue workers

### BullMQ vs Bull

1. **TypeScript-first**: BullMQ ditulis dalam TypeScript, type safety out-of-the-box
2. **Sandboxed processors**: Worker berjalan di separate process, crash tidak mempengaruhi main app
3. **Flow jobs**: Mendukung parent-child job dependencies, ideal untuk multi-step import pipeline
4. **Rate limiting built-in**: Mencegah database overload saat bulk processing
5. **Better event system**: Granular events untuk progress tracking (active, completed, failed, progress)

### Catatan Penting untuk Technical Interview

**Q: Kenapa memilih Node.js dibanding Laravel padahal Laravel lebih cepat untuk CRUD?**
Sistem ini pada intinya adalah **ETL (Extract, Transform, Load)** engine yang I/O bound. Node.js memiliki keunggulan mutlak dalam hal *streaming* file besar (menghindari memory limit) berkat arsitektur *non-blocking I/O*. Selain itu, Node.js mendukung koneksi *real-time* (SSE/WebSockets) secara native tanpa perlu *server* tambahan, yang sangat dibutuhkan untuk fitur *progress bar* saat upload. Laravel sangat bagus, tetapi untuk *data processing engine* mandiri yang konstan membaca ribuan baris file Excel dan menembakkannya ke klien secara *real-time*, ekosistem Node.js jauh lebih cocok secara performa.

**Q: Kenapa menggunakan Redis padahal instruksi hanya meminta MySQL/PostgreSQL?**
Instruksi tugas memberikan opsi *Queue Manager* berupa **Laravel Queue** atau **Bull**. Karena kita memilih ekosistem Node.js, kita wajib menggunakan **Bull** (atau BullMQ). Arsitektur Bull dirancang murni untuk berjalan di atas Redis dan tidak bisa menggunakan PostgreSQL/MySQL sebagai databasenya. Redis digunakan Bull untuk menyimpan antrian *job* secara aman di luar memori utama Node.js, menjaga status pemrosesan, dan memfasilitasi komunikasi *progress bar* antar proses secara *real-time*. Oleh karena itu, Redis adalah prasyarat mutlak yang tak terpisahkan dari Bull.

**Q: Kenapa menggunakan Docker untuk menjalankan database dan Redis?**
Sebagai seorang *Fullstack Engineer*, praktik standar dalam proses *development* adalah memastikan konsistensi *environment* antara mesin developer, mesin penyeleksi, dan server *production*. Menggunakan Docker Compose memastikan versi PostgreSQL (16) dan Redis (7) yang digunakan selalu identik di mana pun aplikasi dijalankan, menghindari masalah klasik *"it works on my machine"*. Selain itu, Docker mempermudah *interviewer* untuk langsung menjalankan dan menguji aplikasi ini hanya dengan satu *command* (`docker compose up -d`) tanpa harus mengotori sistem komputer mereka dengan instalasi database secara manual.

---

## Scope Pekerjaan

1. Inisialisasi monorepo structure (backend + frontend)
2. Setup TypeScript configuration untuk backend dan frontend
3. Setup Express server dengan middleware dasar
4. Setup React + Vite project
5. Docker Compose untuk PostgreSQL + Redis
6. Environment configuration (.env)
7. Linting & formatting (ESLint + Prettier)
8. Git configuration (.gitignore)
9. Package.json scripts untuk development workflow

---

## Requirement

### System Requirements

- Node.js >= 20 LTS
- npm >= 10
- Docker & Docker Compose
- Git

### Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.x",
    "cors": "^2.8.x",
    "helmet": "^8.x",
    "morgan": "^1.10.x",
    "dotenv": "^16.x",
    "pg": "^8.13.x",
    "knex": "^3.1.x",
    "bullmq": "^5.x",
    "ioredis": "^5.x",
    "exceljs": "^4.4.x",
    "multer": "^1.4.x",
    "winston": "^3.x",
    "zod": "^3.x",
    "uuid": "^10.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tsx": "^4.x",
    "nodemon": "^3.x",
    "@types/express": "^5.x",
    "@types/cors": "^2.x",
    "@types/multer": "^1.x",
    "@types/morgan": "^1.x",
    "@types/pg": "^8.x",
    "@types/uuid": "^10.x",
    "eslint": "^9.x",
    "prettier": "^3.x",
    "@typescript-eslint/eslint-plugin": "^8.x",
    "@typescript-eslint/parser": "^8.x"
  }
}
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-router-dom": "^7.x",
    "axios": "^1.x",
    "react-dropzone": "^14.x",
    "react-hot-toast": "^2.x",
    "lucide-react": "^0.460.x",
    "recharts": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^6.x",
    "@vitejs/plugin-react": "^4.x",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```

---

## Struktur Folder yang Dihasilkan

```
business-case-fullstack-engineer/
├── docs/
│   ├── PROJECT_SPEC.md
│   └── guidelines/
│       ├── PROMPT.md
│       └── 01-PROJECT-SETUP.md
├── file/                          # Input Excel files (existing)
│   ├── SALES DAILY.xlsx
│   ├── SALES MP.xlsx
│   └── SALES PRODUK.xlsx
├── result/                        # Output Excel files (existing templates)
│   ├── FINANCE.XLSX
│   └── MARKETING.XLSX
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── .env
│   ├── .env.example
│   ├── src/
│   │   ├── index.ts                    # Entry point
│   │   ├── app.ts                      # Express app setup
│   │   ├── config/
│   │   │   ├── index.ts                # Config loader
│   │   │   ├── database.ts             # Knex configuration
│   │   │   ├── redis.ts                # Redis/IORedis configuration
│   │   │   └── queue.ts                # BullMQ configuration
│   │   ├── shared/
│   │   │   ├── types/
│   │   │   │   └── index.ts            # Shared TypeScript types
│   │   │   ├── errors/
│   │   │   │   └── index.ts            # Custom error classes
│   │   │   ├── utils/
│   │   │   │   └── index.ts            # Utility functions
│   │   │   └── constants/
│   │   │       └── index.ts            # Application constants
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts         # Global error handler
│   │   │   ├── requestLogger.ts        # Request logging
│   │   │   └── uploadHandler.ts        # Multer config
│   │   ├── modules/                    # Feature modules (populated in later phases)
│   │   │   └── .gitkeep
│   │   ├── database/
│   │   │   ├── migrations/             # Knex migrations (populated Phase 2)
│   │   │   │   └── .gitkeep
│   │   │   └── seeds/                  # Knex seeds (populated Phase 2)
│   │   │       └── .gitkeep
│   │   ├── queues/                     # Queue definitions (populated Phase 4)
│   │   │   └── .gitkeep
│   │   └── workers/                    # Queue workers (populated Phase 4)
│   │       └── .gitkeep
│   └── uploads/                        # Temp upload directory
│       └── .gitkeep
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx                    # Entry point
│       ├── App.tsx                     # Root component
│       ├── index.css                   # Global styles
│       ├── vite-env.d.ts
│       ├── api/                        # API client (populated Phase 6)
│       │   └── .gitkeep
│       ├── components/                 # Shared components (populated Phase 6)
│       │   └── .gitkeep
│       ├── pages/                      # Page components (populated Phase 6)
│       │   └── .gitkeep
│       ├── hooks/                      # Custom hooks (populated Phase 6)
│       │   └── .gitkeep
│       └── types/                      # Frontend types (populated Phase 6)
│           └── .gitkeep
├── docker-compose.yml
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── README.md
└── PROBLEM.md
```

---

## Daftar File yang Harus Dibuat

| # | File | Deskripsi |
|---|------|-----------|
| 1 | `docker-compose.yml` | PostgreSQL 16 + Redis 7 services |
| 2 | `.gitignore` | Node.js, TypeScript, uploads, .env |
| 3 | `.prettierrc` | Consistent code formatting |
| 4 | `backend/package.json` | Dependencies + scripts |
| 5 | `backend/tsconfig.json` | TypeScript strict mode config |
| 6 | `backend/nodemon.json` | Dev server auto-reload |
| 7 | `backend/.env.example` | Environment template |
| 8 | `backend/.env` | Local development values |
| 9 | `backend/src/index.ts` | Server bootstrap & startup |
| 10 | `backend/src/app.ts` | Express app with middleware chain |
| 11 | `backend/src/config/index.ts` | Centralized config from env vars |
| 12 | `backend/src/config/database.ts` | Knex PostgreSQL config |
| 13 | `backend/src/config/redis.ts` | IORedis connection config |
| 14 | `backend/src/config/queue.ts` | BullMQ default options |
| 15 | `backend/src/shared/types/index.ts` | Base types (ApiResponse, Pagination, etc.) |
| 16 | `backend/src/shared/errors/index.ts` | AppError, ValidationError, NotFoundError |
| 17 | `backend/src/shared/utils/index.ts` | Helpers (date formatter, slugify, etc.) |
| 18 | `backend/src/shared/constants/index.ts` | HTTP status codes, queue names, etc. |
| 19 | `backend/src/middleware/errorHandler.ts` | Catch-all error middleware |
| 20 | `backend/src/middleware/requestLogger.ts` | Morgan + Winston integration |
| 21 | `backend/src/middleware/uploadHandler.ts` | Multer config (xlsx only, size limit) |
| 22 | `frontend/package.json` | Dependencies + scripts |
| 23 | `frontend/tsconfig.json` | TypeScript config |
| 24 | `frontend/vite.config.ts` | Vite + React plugin + proxy |
| 25 | `frontend/index.html` | HTML entry point |
| 26 | `frontend/src/main.tsx` | React DOM render |
| 27 | `frontend/src/App.tsx` | Root component placeholder |
| 28 | `frontend/src/index.css` | CSS reset + design tokens |

---

## Penjelasan Teknis

### 1. Docker Compose Configuration

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: sales_transform
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: secret123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U developer -d sales_transform"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

### 2. Express App Setup Pattern

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes akan ditambahkan di Phase 3

// Error handler (HARUS di paling bawah)
app.use(errorHandler);

export default app;
```

### 3. Centralized Config Pattern

```typescript
// src/config/index.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('sales_transform'),
  DB_USER: z.string().default('developer'),
  DB_PASSWORD: z.string().default('secret123'),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  
  // Upload
  MAX_FILE_SIZE: z.coerce.number().default(50 * 1024 * 1024), // 50MB
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const config = envSchema.parse(process.env);
export type Config = z.infer<typeof envSchema>;
```

### 4. Global Error Handler Pattern

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Unexpected errors
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

### 5. Custom Error Classes

```typescript
// src/shared/errors/index.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}
```

### 6. Multer Upload Configuration

```typescript
// src/middleware/uploadHandler.ts
import multer from 'multer';
import path from 'path';
import { config } from '../config';
import { ValidationError } from '../shared/errors';

const storage = multer.diskStorage({
  destination: config.UPLOAD_DIR,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only Excel files (.xlsx, .xls) are allowed'));
  }
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_FILE_SIZE },
}).array('files', 3); // Maksimal 3 file sekaligus
```

### 7. Vite Proxy Configuration

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Checklist

- [ ] Docker Compose running (PostgreSQL + Redis healthy)
- [ ] `npm install` berhasil di backend dan frontend
- [ ] Backend server berjalan di port 3000
- [ ] Frontend dev server berjalan di port 5173
- [ ] Health check endpoint `/api/health` merespons `{ status: 'ok' }`
- [ ] Proxy frontend → backend berfungsi
- [ ] Environment variables terload dari `.env`
- [ ] Error handler menangkap dan format error dengan benar
- [ ] Upload handler menerima file Excel dan menolak file lain
- [ ] Winston logger menulis ke console dan file
- [ ] TypeScript strict mode aktif tanpa error
- [ ] ESLint + Prettier berjalan tanpa warning
- [ ] Semua `.gitkeep` files ada di folder yang masih kosong

---

## Acceptance Criteria

1. ✅ `docker compose up -d` berhasil menjalankan PostgreSQL dan Redis
2. ✅ `cd backend && npm run dev` memulai server Express tanpa error
3. ✅ `cd frontend && npm run dev` memulai Vite dev server tanpa error
4. ✅ `curl http://localhost:3000/api/health` mengembalikan JSON response
5. ✅ Frontend dapat diakses di `http://localhost:5173`
6. ✅ API call dari frontend ke `/api/health` berhasil melalui proxy
7. ✅ File upload endpoint menerima `.xlsx` dan menolak `.pdf`
8. ✅ Sending invalid JSON ke API mengembalikan structured error response
9. ✅ TypeScript compilation (`tsc --noEmit`) berhasil tanpa error

---

## Catatan Best Practice

1. **Strict TypeScript**: Gunakan `strict: true` di `tsconfig.json`. Jangan gunakan `any` kecuali benar-benar diperlukan — gunakan `unknown` dan narrow dengan type guard
2. **Environment Validation**: Validasi semua env vars saat startup dengan Zod. App harus fail-fast jika env tidak lengkap
3. **Security Headers**: Helmet.js sudah memberikan security headers default. Konfigurasi CORS secara eksplisit, jangan gunakan `cors({ origin: '*' })` di production
4. **Logging**: Gunakan Winston dengan level berbeda (error → file, info → console). Jangan log sensitive data (passwords, tokens)
5. **Graceful Shutdown**: Implementasi signal handler (SIGTERM, SIGINT) untuk menutup koneksi DB, Redis, dan queue dengan benar
6. **Monorepo Scripts**: Tambahkan npm scripts di root untuk menjalankan backend + frontend secara bersamaan (`concurrently`)
7. **Git Hooks**: Pertimbangkan `husky` + `lint-staged` untuk pre-commit linting
8. **Health Check**: Endpoint health check harus juga cek koneksi DB dan Redis, bukan hanya return OK
