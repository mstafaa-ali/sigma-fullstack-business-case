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
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      worksheets: 'emit',
    });

    let headers: string[] = [];
    let chunk: ExcelRow[] = [];
    let rowCount = 0;

    for await (const worksheetReader of workbook) {
      for await (const row of worksheetReader) {
        if (row.number === 1) {
          // Header row
          headers = (row.values as any[]).slice(1).map(String);
          continue;
        }

        rowCount++;
        const values = (row.values as any[]).slice(1);
        const mappedRow: Record<string, unknown> = {};

        headers.forEach((header, index) => {
          const internalField = columnMappings.get(header);
          if (internalField) {
            mappedRow[internalField] = values[index] ?? null;
          }
        });

        const excelRow: ExcelRow = { rowNumber: row.number, data: mappedRow };
        this.emit('row', excelRow);
        chunk.push(excelRow);

        if (chunk.length >= this.CHUNK_SIZE) {
          this.emit('chunk', [...chunk]);
          chunk = [];
        }
      }
    }

    // Emit remaining rows
    if (chunk.length > 0) {
      this.emit('chunk', [...chunk]);
    }

    this.emit('end', { totalRows: rowCount });
  }
}
