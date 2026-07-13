import ExcelJS from 'exceljs';
import { ColumnMappingRepository } from '../column-mapping/column-mapping.repository';

export class FileValidatorService {
  constructor(
    private columnMappingRepo: ColumnMappingRepository
  ) {}

  /**
   * Mendeteksi tipe file berdasarkan kolom header
   * DAILY: memiliki 'Warehouse' dan 'Status Order'
   * MP: memiliki 'City' dan 'Province' (bukan 'ProvinsiCustomer')
   * PRODUK: memiliki 'ProvinsiCustomer' tapi TIDAK ada 'Warehouse'
   */
  async detectFileType(filePath: string): Promise<'DAILY' | 'MP' | 'PRODUK'> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as string[];

    if (headers.includes('Warehouse') && headers.includes('Status Order')) {
      return 'DAILY';
    }
    if (headers.includes('City') && headers.includes('Province')) {
      return 'MP';
    }
    return 'PRODUK';
  }

  /**
   * Validasi bahwa kolom di file cocok dengan mapping di database
   */
  async validateHeaders(
    filePath: string,
    fileType: 'DAILY' | 'MP' | 'PRODUK'
  ): Promise<{ valid: boolean; errors: string[] }> {
    const mappings = await this.columnMappingRepo.findByFileType(fileType);
    const expectedColumns = mappings.map(m => m.source_column);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1);
    const actualHeaders = (headerRow.values as string[]).filter(Boolean);

    const errors: string[] = [];
    for (const expected of expectedColumns) {
      if (!actualHeaders.includes(expected)) {
        errors.push(`Missing column: ${expected}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
