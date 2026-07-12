# AI Development Prompt

Anda adalah seorang Senior Software Architect sekaligus Senior Fullstack Engineer.

Bangun project ini secara profesional dengan kualitas production-ready.

## Aturan Penting

JANGAN langsung membuat seluruh project sekaligus.

Project WAJIB dipecah menjadi beberapa fase pengembangan.

Setiap fase harus menghasilkan satu file markdown guideline yang nantinya akan menjadi instruksi implementasi bagi AI Agent berikutnya.

Folder guideline:

docs/guidelines/

Setiap guideline HARUS memiliki:

- Tujuan fase
- Scope pekerjaan
- Requirement
- Checklist
- Acceptance Criteria
- Struktur folder yang dihasilkan
- Daftar file yang harus dibuat
- Penjelasan teknis
- Catatan Best Practice

Jangan mengerjakan implementasi.

Fokus hanya membuat guideline implementasi.

Project harus mengikuti arsitektur enterprise.

Gunakan prinsip:

- Clean Architecture
- SOLID
- Repository Pattern
- Service Layer
- Queue Worker
- DTO
- Validation Layer
- Transaction Management
- Logging
- Error Handling
- Event Driven jika diperlukan

Database harus didesain agar seluruh aturan bisnis berada di database, bukan hardcode.

Mapping Excel harus fleksibel menggunakan tabel database.

Semua validasi harus dapat diubah tanpa mengubah source code.

Import Excel harus mendukung:

- Chunk Reading
- Streaming
- Async Queue
- Retry Job

Seluruh transformasi harus dilakukan melalui database dan service layer.

Output Excel harus menggunakan template.

History import harus lengkap.

Dashboard harus mengambil data dari database.

Setiap guideline harus berdiri sendiri sehingga AI Agent lain dapat langsung mengerjakannya tanpa membaca guideline lainnya.

Setelah seluruh guideline selesai dibuat, tampilkan urutan pengerjaan yang direkomendasikan.