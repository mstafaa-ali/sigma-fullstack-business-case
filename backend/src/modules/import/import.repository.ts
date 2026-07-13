import { BaseRepository } from '../shared/base.repository';
import { Knex } from 'knex';

export interface ImportSession {
  id: string;
  status: string;
  started_at: Date;
  completed_at: Date | null;
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  error_rows: number;
  skipped_rows: number;
  file_names: string; // Stored as JSON string
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ImportLog {
  id: number;
  session_id: string;
  file_name: string;
  row_number: number;
  log_level: 'info' | 'warn' | 'error';
  message: string;
  raw_data: string | null; // Stored as JSON string
  created_at: Date;
  updated_at: Date;
}

export class ImportRepository extends BaseRepository<ImportSession> {
  constructor() {
    super('import_sessions');
  }

  async createLog(data: Partial<ImportLog>, trx?: Knex.Transaction): Promise<ImportLog> {
    const query = trx ? trx('import_logs') : this.knex('import_logs');
    const [result] = await query.insert(data).returning('*');
    return result as ImportLog;
  }

  async getLogsBySessionId(session_id: string, log_level?: string): Promise<ImportLog[]> {
    const query = this.knex('import_logs').where({ session_id });
    if (log_level) {
      query.where({ log_level });
    }
    return query.orderBy('created_at', 'asc');
  }
  async updateSession(id: string, data: Partial<ImportSession>): Promise<ImportSession | null> {
    const query = this.knex(this.tableName).where({ id });
    const [result] = await query.update({ ...data, updated_at: this.knex.fn.now() }).returning('*');
    return result as ImportSession | null;
  }

  async incrementSessionCounters(id: string, counters: { processed_rows?: number; error_rows?: number; success_rows?: number; skipped_rows?: number }): Promise<void> {
    const updateData: Record<string, any> = { updated_at: this.knex.fn.now() };
    if (counters.processed_rows !== undefined) {
      updateData.processed_rows = this.knex.raw(`COALESCE(processed_rows, 0) + ?`, [counters.processed_rows]);
    }
    if (counters.error_rows !== undefined) {
      updateData.error_rows = this.knex.raw(`COALESCE(error_rows, 0) + ?`, [counters.error_rows]);
    }
    if (counters.success_rows !== undefined) {
      updateData.success_rows = this.knex.raw(`COALESCE(success_rows, 0) + ?`, [counters.success_rows]);
    }
    if (counters.skipped_rows !== undefined) {
      updateData.skipped_rows = this.knex.raw(`COALESCE(skipped_rows, 0) + ?`, [counters.skipped_rows]);
    }
    await this.knex(this.tableName).where({ id }).update(updateData);
  }
}

export const importRepository = new ImportRepository();
