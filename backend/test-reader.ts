import { ExcelReaderService } from './src/modules/import/excel-reader.service';
import path from 'path';

async function test() {
  const columnMap = new Map([
    ['Date', 'order_date'],
    ['OrderNumber', 'invoice_number'],
    ['ProductCode', 'product_code']
  ]);

  const reader = new ExcelReaderService();
  
  reader.on('row', (row) => {
    console.log('Emitted ROW:', row.rowNumber, row.data);
  });
  
  reader.on('chunk', (chunk) => {
    console.log('Emitted CHUNK:', chunk.length, 'rows');
  });

  reader.on('end', () => {
    console.log('Ended reading.');
  });

  reader.on('error', (err) => {
    console.error('Error:', err);
  });

  const filePath = path.join('/Users/macairm12020/Projects/business-case-fullstack-engineer/file', 'SALES DAILY.xlsx');
  await reader.readFileStreaming(filePath, columnMap);
}

test().catch(console.error);
