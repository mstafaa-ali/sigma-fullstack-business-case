import { ImportSession, ImportRepository, ImportLog } from './import.repository';
import { BaseService } from '../shared/base.service';
import { Knex } from 'knex';
import ExcelJS from 'exceljs';

import { createImportFlow } from '../../queues/import.queue';

// Note: BullMQ and real queue integration will happen in phase 4. 
// For now, initiateImport just creates the session in DB.
export class ImportService extends BaseService<ImportSession, any, any> {
  constructor(protected readonly repository: ImportRepository) {
    super(repository);
  }

  async initiateImport(files: Express.Multer.File[]): Promise<ImportSession> {
    const fileNames = files.map(f => f.originalname);
    const session = await this.repository.create({
      status: 'pending',
      file_names: JSON.stringify(fileNames),
    });

    // Step 1: Initialize the flow
    const flowFiles = files.map(f => ({
      path: f.path,
      originalname: f.originalname,
      fileType: 'UNKNOWN', // File type will be determined in validate worker
    }));

    await createImportFlow(session.id, flowFiles);

    return session;
  }

  async getSessions(options?: { page?: number; limit?: number }): Promise<{ data: ImportSession[]; total: number }> {
    return this.repository.findAll({
      ...options,
      orderBy: 'created_at',
      order: 'desc'
    });
  }

  async getSessionById(id: string): Promise<ImportSession | null> {
    return this.repository.findById(id);
  }

  async getSessionLogs(id: string, level?: string): Promise<ImportLog[]> {
    return this.repository.getLogsBySessionId(id, level);
  }

  async generateLogFile(id: string): Promise<Buffer> {
    const logs = await this.getSessionLogs(id, 'error');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Error Logs');
    
    worksheet.columns = [
      { header: 'Row Number', key: 'row_number', width: 15 },
      { header: 'File Name', key: 'file_name', width: 30 },
      { header: 'Message', key: 'message', width: 50 },
      { header: 'Raw Data', key: 'raw_data', width: 50 },
    ];

    logs.forEach(log => {
      worksheet.addRow({
        row_number: log.row_number,
        file_name: log.file_name,
        message: log.message,
        raw_data: log.raw_data ? JSON.stringify(log.raw_data) : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}
