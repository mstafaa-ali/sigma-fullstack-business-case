# Catatan Kendala & Solusi (PROBLEM.md)

Dokumen ini berisi rangkuman mengenai kendala teknis yang dihadapi saat membangun sistem transformasi data penjualan, beserta solusi yang diimplementasikan.

### 1. Pembacaan File Berukuran Besar (Memory Limit)
**Masalah:** Membaca file Excel berekstensi `.xlsx` dengan ribuan atau puluhan ribu baris sekaligus ke dalam memori NodeJS dapat menyebabkan kehabisan kapasitas memori (`heap out of memory`), terutama saat menangani banyak antrean *import* secara bersamaan.
**Solusi:**
- Menggunakan pustaka `exceljs` untuk membaca file dengan memanfaatkan iterator bawaannya. 
- Baris yang dibaca tidak disimpan secara penuh ke dalam sebuah *array* raksasa, melainkan diakumulasikan secara parsial di dalam memori (`chunk` berisi 100 baris) sebelum di-*emit* dan ditangkap untuk dieksekusi proses *insert* ke *database*. Hal ini menekan beban *garbage collector*.

### 2. Inkonsistensi Nama Kolom
**Masalah:** Nama kolom (header) pada file Excel yang berasal dari *platform* yang berbeda-beda bisa memiliki penamaan yang bervariasi (contoh: `No. Pesanan` vs `Nomor Pesanan`). Melakukan *parsing* dengan skema statis atau *hardcode* dalam kode sangat rentan menyebabkan *error*.
**Solusi:**
- Menerapkan arsitektur **Column Mapping** berbasis *database*. Sistem membaca konfigurasi relasi dari tabel `column_mappings` untuk mencocokkan *header* kolom sumber dari file Excel ke struktur kolom *internal* yang ada di dalam *database* (`internal_field`). Hal ini memungkinkan penambahan jenis kolom di masa depan tanpa merubah kode aplikasi.

### 3. Duplikasi Data Saat Re-import
**Masalah:** Apabila *user* mengunggah file yang sama, atau mencoba mengimpor ulang *session* yang gagal, ada kemungkinan data penjualan tergandakan di dalam *database*.
**Solusi:**
- Menambahkan **Unique Constraint** secara komposit (contohnya perpaduan `session_id`, `file_type`, dan `row_number`) di skema tabel utama *database*.
- Menggunakan pendekatan **Bulk Upsert** (fitur `ON CONFLICT DO UPDATE` di PostgreSQL) via pustaka `knex`. Hal ini memastikan bahwa baris data yang sama akan tertimpa atau di-*update* statusnya, sementara baris yang baru akan ditambahkan dengan aman tanpa menimbulkan *conflict error*.

### 4. Transparansi Progress (Responsiveness UI)
**Masalah:** Operasi validasi dan transformasi untuk ukuran data yang cukup besar akan berjalan secara *asynchronous* dan mungkin memakan waktu hingga beberapa menit. Pendekatan konvensional menggunakan *polling* dari sisi *frontend* akan membebani HTTP server dan tidak bisa menampilkan hasil secara *real-time*.
**Solusi:**
- Menggunakan teknologi **Server-Sent Events (SSE)**.
- Backend, termasuk sistem pemroses *queue* (BullMQ), dirancang untuk menerbitkan *progress* (baris yang diproses dan fase operasional) secara konstan ke saluran Redis Pub/Sub, yang diteruskan ke koneksi HTTP persisten SSE milik *client*. Komponen UI di React (seperti `UploadProgress` dan `SessionList`) menyimak aliran *event* ini untuk segera merender ulang tampilan progres (`progress bar`) seketika juga.

### 5. ES Module vs CommonJS di Knex CLI
**Masalah:** Saat mengeksekusi perintah inisialisasi *database* bawaan seperti `knex migrate:latest` atau `knex seed:run`, NodeJS melempar pesan *error* karena adanya ketidakcocokan sistem modul (ESM vs CJS).
**Solusi:**
- Menggunakan modul tambahan seperti `tsx` atau `ts-node` dalam *script* `package.json` untuk menjalankan konfigurasi `knexfile.ts` secara aman di lingkungan *TypeScript*, dan menyesuaikan parameter kompiler TypeScript (`tsconfig.json`) agar output target lebih mudah dikelola.
