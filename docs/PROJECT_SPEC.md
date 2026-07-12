# Sales Data Transformation System

## A. Latar Belakang

Perusahaan memiliki tiga file Excel data penjualan yang selama ini diproses secara manual. Proses tersebut rentan terhadap human error, membutuhkan waktu yang lama, serta tidak memiliki standar yang konsisten.

Untuk mengatasi permasalahan tersebut dibutuhkan sistem web otomatis untuk menggantikan proses tersebut secara efisien dan terstandarisasi.

---

# B. Tujuan

Membangun sistem fullstack yang dapat mengimport 3 file Excel, memproses transformasi data melalui database, dan menghasilkan 2 file output secara otomatis.

---

# C. Data Sumber & Format Output

## Input

Input Files: /Users/macairm12020/Projects/business-case-fullstack-engineer/file

## Output

Format Output: /Users/macairm12020/Projects/business-case-fullstack-engineer/result

---

# D. Ketentuan Data

- Produk dapat berupa bundling (berisi dua produk atau lebih)
- Harga jual / HPP produk dapat berbeda pada setiap platform

---

# E. Tech Stack

| Layer | Teknologi |
|---------|------------|
| Backend | Laravel atau Node.js (Express) |
| Database | MySQL atau PostgreSQL |
| Frontend | Blade / Vue / React |
| Queue | Laravel Queue / Bull |
| Storage | Local Storage / Google Drive API |

---

# F. Alur Sistem

```text
Upload Excel
      │
      ▼
Validasi File
      │
      ▼
Proses DB
      │
      ▼
Transformasi
      │
      ▼
Generate Output
      │
      ▼
Notifikasi
```

---

# G. Fitur

1. Upload 3 file Excel sekaligus (drag & drop)
2. Validasi otomatis per baris via DB bukan hardcode
3. Notifikasi real-time (progress bar + toast sukses/gagal)
4. Generate 2 file output otomatis sesuai format
5. History log lengkap + error report downloadable
6. Dashboard summary statistik hasil import

---

# H. Potensi Masalah

| Permasalahan | Solusi |
|---------------|---------|
| Format tidak konsisten antar file | Normalisasi via mapping rule di DB |
| File berukuran besar | Proses async menggunakan job queue |
| Duplikasi data saat re-import | Unique constraint + upsert logic |
| Nama kolom Excel berubah | Mapping fleksibel berbasis DB |
| Memory limit saat membaca file | Streaming reader per chunk/baris |

---

# I. Kriteria Penilaian

| Aspek | Target |
|---------|---------|
| Result | Data akurat, 2 output file sesuai format yang diminta |
| Notification | Real-time progress, toast alert, log error downloadable |
| Efektivitas DB | Bulk insert, index optimal, minim native code, Relasi
antar-tabel optimal|
| Problem & Solusi | Dokumentasi kendala teknis beserta solusi yang diterapkan |
| Kreativitas/ Add-On | Contoh: rollback data, dashboard statistik |

---

# J. Output

1. Source code di-upload ke GitHub
2. Dua file output hasil transformasi data masukan GitHub di folder result
3. PROBLEM.md permasalahan yang dihadapi dan solusi yang digunakan masukan GitHub
4. README.md berisi instruksi instalasi dan menjalankan aplikasi masukan GitHub
5. Video demo tampilan & fitur aplikasi (Link Youtube)