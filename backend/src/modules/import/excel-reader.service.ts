import ExcelJS from 'exceljs';
import { EventEmitter } from 'events';

export interface ExcelRow {
  rowNumber: number;
  data: Record<string, unknown>;
}

export class ExcelReaderService extends EventEmitter {
  private readonly CHUNK_SIZE = 100;

  /**
   * Streaming reader — tidak load seluruh file ke memory
   * Emit events: 'row', 'chunk', 'end', 'error'
   */
  async readFileStreaming(
    filePath: string,
    columnMappings: Map<string, string> // sourceColumn → internalField
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    let headers: string[] = [];
    let chunk: ExcelRow[] = [];
    let rowCount = 0;

    const worksheet = workbook.worksheets[0];
    if (!worksheet) return;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Header row
        headers = [];
        for (let i = 1; i <= row.cellCount; i++) {
           const cellValue = row.getCell(i).value;
           headers.push(cellValue ? String(cellValue).trim() : '');
        }
        return;
      }

      rowCount++;
      const mappedRow: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        const internalField = columnMappings.get(header);
        if (internalField) {
          let val = row.getCell(index + 1).value ?? null;
          // Handle Excel serial date if field is order_date
          if (internalField === 'order_date' && typeof val === 'number') {
             // Excel epoch is usually 1899-12-30
             const date = new Date(Math.round((val - 25569) * 86400 * 1000));
             val = date.toISOString().split('T')[0];
          } else if (internalField === 'order_date' && val instanceof Date) {
             val = val.toISOString().split('T')[0];
          }
          mappedRow[internalField] = val;
        }
      });

        const isEmpty = Object.values(mappedRow).every(val => val === null || val === undefined || val === '');
        if (isEmpty) return;

        const excelRow: ExcelRow = { rowNumber: row.number, data: mappedRow };
        this.emit('row', excelRow);
        chunk.push(excelRow);

        if (chunk.length >= this.CHUNK_SIZE) {
          this.emit('chunk', [...chunk]);
          chunk = [];
        }
    });

    // Emit remaining rows
    if (chunk.length > 0) {
      this.emit('chunk', [...chunk]);
    }

    this.emit('end', { totalRows: rowCount });
  }
}
