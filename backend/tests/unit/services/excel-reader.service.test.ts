import { describe, it, expect } from 'vitest';
import { ExcelReaderService } from '../../../src/modules/import/excel-reader.service';
import path from 'path';

describe('ExcelReaderService', () => {
  it('should parse SALES DAILY correctly', async () => {
    const reader = new ExcelReaderService();
    const filePath = path.join(__dirname, '../../fixtures/SALES_DAILY_TEST.xlsx');
    
    // Mappings based on seeds
    const columnMap = new Map([
      ['Date', 'order_date'],
      ['OrderNumber', 'invoice_number'],
      ['ProductCode', 'product_code'],
      ['Qty', 'quantity']
    ]);

    const rows: any[] = [];
    reader.on('row', row => rows.push(row));

    await reader.readFileStreaming(filePath, columnMap);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].data.order_date).toBeDefined();
    expect(rows[0].data.invoice_number).toBeDefined();
    expect(rows[0].data.product_code).toBeDefined();
  });
});
