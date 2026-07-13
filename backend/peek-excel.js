import ExcelJS from 'exceljs';
import path from 'path';

async function readExcel(filePath) {
  console.log(`\n--- Reading ${path.basename(filePath)} ---`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  
  if (!worksheet) {
    console.log("No worksheet found.");
    return;
  }
  
  const headers = worksheet.getRow(1).values.slice(1);
  console.log("HEADERS:", headers);
  
  for (let i = 2; i <= 4; i++) {
    const row = worksheet.getRow(i);
    if (!row.hasValues) break;
    const values = row.values.slice(1);
    
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx];
    });
    console.log(`ROW ${i}:`, JSON.stringify(obj, null, 2));
  }
}

async function main() {
  const dir = '/Users/macairm12020/Projects/business-case-fullstack-engineer/file';
  await readExcel(path.join(dir, 'SALES DAILY.xlsx'));
  await readExcel(path.join(dir, 'SALES MP.xlsx'));
  await readExcel(path.join(dir, 'SALES PRODUK.xlsx'));
}

main().catch(console.error);
