# Sales Data Transformation System

Sistem fullstack untuk mengimpor, memvalidasi, mentransformasi, dan mengekspor data penjualan (Excel) secara otomatis.

## 🚀 Fitur Utama

- **Upload 3 file Excel sekaligus** (drag & drop)
- **Validasi otomatis** berdasarkan aturan dinamis di database.
- **Pemrosesan Asinkron** dengan BullMQ untuk file berukuran besar.
- **Notifikasi Real-time** menggunakan Server-Sent Events (SSE).
- **Dashboard Summary** statistik impor.
- **Log Error Downloadable** untuk memudahkan investigasi masalah data.
- **Ekspor Otomatis** 2 file (`FINANCE.xlsx` & `MARKETING.xlsx`).

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, TypeScript, BullMQ
- **Database:** PostgreSQL (Knex.js query builder), Redis
- **Frontend:** React, Vite, Tailwind CSS, Recharts

## 📦 Prasyarat

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & Docker Compose

## ⚙️ Cara Menjalankan

### 1. Jalankan Database & Redis
Aplikasi membutuhkan PostgreSQL dan Redis yang berjalan. Anda bisa menjalankannya via Docker Compose:
```bash
docker-compose up -d
```

### 2. Setup Backend
Buka terminal dan masuk ke folder `backend`:
```bash
cd backend
cp .env.example .env
npm install
```

Jalankan migrasi database dan seeders:
```bash
npx knex migrate:latest
npx knex seed:run
```

Jalankan server backend:
```bash
npm run dev
```
Backend akan berjalan di `http://localhost:3000`.

### 3. Setup Frontend
Buka terminal baru dan masuk ke folder `frontend`:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`. Buka URL tersebut di browser.

## 📂 Struktur Direktori Penting

- `backend/`: Source code untuk backend API dan worker pemroses antrean.
- `frontend/`: Source code React SPA.
- `file/`: Contoh input file (DAILY, MP, PRODUK).
- `result/`: Folder output otomatis dari hasil pemrosesan (FINANCE & MARKETING).
- `PROBLEM.md`: Dokumen yang mencatat kendala teknis dan solusi selama pengerjaan.
