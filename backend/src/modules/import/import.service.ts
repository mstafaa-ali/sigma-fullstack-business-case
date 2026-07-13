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

  private mapSessionToResponse(session: ImportSession) {
    let mappedStatus = session.status;
    if (session.status === 'completed') {
      if (session.skipped_rows > 0 && session.success_rows === 0) {
        mappedStatus = 'skipped';
      } else if (session.skipped_rows > 0) {
        mappedStatus = 'partial_success';
      }
    }

    return {
      id: session.id,
      status: mappedStatus,
      startTime: session.started_at || session.created_at,
      endTime: session.completed_at,
      totalRows: session.total_rows || 0,
      validRows: session.success_rows || 0,
      invalidRows: session.error_rows || 0,
      skippedRows: session.skipped_rows || 0,
      processedRows: session.processed_rows || 0,
      fileNames: typeof session.file_names === 'string' 
        ? JSON.parse(session.file_names) 
        : session.file_names,
      errorMessage: null,
      createdAt: session.created_at,
    };
  }

  async getSessions(options?: { page?: number; limit?: number; status?: string }): Promise<{
    data: any[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;

    const result = await this.repository.findAll({
      page,
      limit,
      orderBy: 'created_at',
      order: 'desc'
    });

    return {
      data: result.data.map(s => this.mapSessionToResponse(s)),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getSessionById(id: string): Promise<any | null> {
    const session = await this.repository.findById(id);
    if (!session) return null;
    return this.mapSessionToResponse(session);
  }

  async getSessionLogs(id: string, level?: string): Promise<ImportLog[]> {
    return this.repository.getLogsBySessionId(id, level);
  }

  async hasErrors(sessionId: string): Promise<boolean> {
    const logs = await this.repository.getLogsBySessionId(sessionId, 'error');
    return logs.length > 0;
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

  async getTransformedData(id: string, page: number = 1, limit: number = 50) {
    const { salesTransformedRepository } = await import('../sales/sales-transformed.repository');
    const result = await salesTransformedRepository.findBySessionId(id, { page, limit });
    return {
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}
