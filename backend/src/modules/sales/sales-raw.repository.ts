import { BaseRepository } from '../shared/base.repository';
import { SalesRawDTO } from './dto/sales-raw.dto';
import { Knex } from 'knex';

export class SalesRawRepository extends BaseRepository<SalesRawDTO> {
  constructor() {
    super('sales_raw');
  }

  async findBySessionId(session_id: string, options?: { page?: number; limit?: number; status?: string }): Promise<{ data: SalesRawDTO[]; total: number }> {
    const { page = 1, limit = 100, status } = options || {};
    const offset = (page - 1) * limit;

    const query = this.knex(this.tableName).where({ session_id });
    if (status) {
      query.where({ status });
    }

    const countQuery = this.knex(this.tableName).where({ session_id });
    if (status) {
      countQuery.where({ status });
    }

    const [data, [{ count }]] = await Promise.all([
      query.orderBy('row_number', 'asc').limit(limit).offset(offset),
      countQuery.count('* as count'),
    ]);

    return { data: data as SalesRawDTO[], total: Number(count) };
  }

  async bulkUpsert(data: Partial<SalesRawDTO>[], trx?: Knex.Transaction): Promise<void> {
    if (!data.length) return;
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    // Use raw query for PostgreSQL bulk upsert or Knex onConflict.
    // For simplicity with generic columns, we can use onConflict
    // We assume row_number + session_id + file_type makes it unique
    await query.insert(data)
      .onConflict(['session_id', 'file_type', 'row_number'])
      .merge();
  }
}

export const salesRawRepository = new SalesRawRepository();
