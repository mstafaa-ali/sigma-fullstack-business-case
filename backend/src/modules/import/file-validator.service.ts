import ExcelJS from 'exceljs';
import { ColumnMappingRepository } from '../column-mapping/column-mapping.repository';

export class FileValidatorService {
  constructor(
    private columnMappingRepo: ColumnMappingRepository
  ) {}

  async detectAndValidate(
    filePath: string
  ): Promise<{ fileType: 'DAILY' | 'MP' | 'PRODUK' | 'UNKNOWN'; valid: boolean; errors: string[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const headerRow = worksheet.getRow(1);
    const headers = (headerRow.values as string[]).filter(Boolean);

    let fileType: 'DAILY' | 'MP' | 'PRODUK' | 'UNKNOWN' = 'UNKNOWN';
    if (headers.includes('Warehouse') && headers.includes('Status Order')) {
      fileType = 'DAILY';
    } else if (headers.includes('City') && headers.includes('Province')) {
      fileType = 'MP';
    } else {
      // By elimination or if it matches produk headers
      fileType = 'PRODUK';
    }

    const mappings = await this.columnMappingRepo.findByFileType(fileType);
    const expectedColumns = mappings.map(m => m.source_column);
    
    const errors: string[] = [];
    for (const expected of expectedColumns) {
      if (!headers.includes(expected)) {
        errors.push(`Missing column: ${expected}`);
      }
    }

    // Force garbage collection of the large workbook object if possible
    // (In JS we can't force it, but we can remove references)
    workbook.worksheets.forEach(ws => ws.destroy?.());

    return { fileType, valid: errors.length === 0, errors };
  }
}
