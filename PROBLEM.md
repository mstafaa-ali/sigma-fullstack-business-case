# Catatan Kendala & Solusi (PROBLEM.md)

Dokumen ini berisi rangkuman mengenai kendala teknis yang dihadapi saat membangun sistem transformasi data penjualan, beserta solusi yang diimplementasikan.

### 1. Inkonsistensi Nama Kolom
**Masalah:** Nama kolom (header) pada file Excel yang berasal dari *platform* yang berbeda-beda bisa memiliki penamaan yang bervariasi (contoh: `No. Pesanan` vs `Nomor Pesanan`). Melakukan *parsing* dengan skema statis atau *hardcode* dalam kode sangat rentan menyebabkan *error*.
**Solusi:**
- Menerapkan arsitektur **Column Mapping** berbasis *database*. Sistem membaca konfigurasi relasi dari tabel `column_mappings` untuk mencocokkan *header* kolom sumber dari file Excel ke struktur kolom *internal* yang ada di dalam *database* (`internal_field`). Hal ini memungkinkan penambahan jenis kolom di masa depan tanpa merubah kode aplikasi.

### 2. Duplikasi Data Saat Re-import
**Masalah:** Apabila *user* mengunggah file yang sama, atau mencoba mengimpor ulang *session* yang gagal, ada kemungkinan data penjualan tergandakan di dalam *database*.
**Solusi:**
- Menambahkan **Unique Constraint** secara komposit pada tabel *database*, yaitu perpaduan `session_id`, `file_type`, dan `row_number` pada tabel `sales_raw`, serta perpaduan `session_id`, `invoice_number`, `product_name`, `product_code_original`, dan `row_number` pada tabel `sales_transformed`.
- Menggunakan pendekatan **Bulk Upsert** (fitur `ON CONFLICT DO UPDATE` di PostgreSQL) via pustaka `knex`. Hal ini memastikan bahwa baris data yang sama akan tertimpa atau di-*update* statusnya, sementara baris yang baru akan ditambahkan dengan aman tanpa menimbulkan *conflict error*.
