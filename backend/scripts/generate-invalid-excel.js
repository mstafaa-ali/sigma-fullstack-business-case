const ExcelJS = require('exceljs');
const path = require('path');

async function createInvalidFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // Menambahkan header yang tidak dikenali sistem
  // Agar dikategorikan sebagai PRODUK tapi gagal validasi karena kolom-kolom wajib (expected columns) tidak ada
  worksheet.addRow(['Kolom Asal', 'Data Tidak Valid', 'Test Error']);

  worksheet.addRow(['123', 'ABC', 'Error 1']);
  worksheet.addRow(['456', 'DEF', 'Error 2']);

  const filePath = path.join(__dirname, '..', 'INVALID_DATA.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('File berhasil dibuat di:', filePath);
}

createInvalidFile().catch(console.error);
