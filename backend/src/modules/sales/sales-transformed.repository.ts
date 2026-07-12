import { BaseRepository } from '../shared/base.repository';
import { SalesTransformedDTO } from './dto/sales-transformed.dto';
import { Knex } from 'knex';

export class SalesTransformedRepository extends BaseRepository<SalesTransformedDTO> {
  constructor() {
    super('sales_transformed');
  }

  async findBySessionId(session_id: string, options?: { page?: number; limit?: number }): Promise<{ data: SalesTransformedDTO[]; total: number }> {
    const { page = 1, limit = 100 } = options || {};
    const offset = (page - 1) * limit;

    const query = this.knex(this.tableName).where({ session_id });
    const countQuery = this.knex(this.tableName).where({ session_id });

    const [data, [{ count }]] = await Promise.all([
      query.orderBy('row_number', 'asc').limit(limit).offset(offset),
      countQuery.count('* as count'),
    ]);

    return { data: data as SalesTransformedDTO[], total: Number(count) };
  }
}

export const salesTransformedRepository = new SalesTransformedRepository();
