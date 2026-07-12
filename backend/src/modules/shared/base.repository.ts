import { Knex } from 'knex';
import { db } from '../../config/database';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly tableName: string,
    protected readonly knex: Knex = db
  ) {}

  async findAll(options?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ data: T[]; total: number }> {
    const { page = 1, limit = 20, orderBy = 'id', order = 'asc' } = options || {};
    const offset = (page - 1) * limit;

    const [data, [{ count }]] = await Promise.all([
      this.knex(this.tableName)
        .orderBy(orderBy, order)
        .limit(limit)
        .offset(offset),
      this.knex(this.tableName).count('* as count'),
    ]);

    return { data: data as T[], total: Number(count) };
  }

  async findById(id: number | string): Promise<T | null> {
    const row = await this.knex(this.tableName).where({ id }).first();
    return (row as T) || null;
  }

  async create(data: Partial<T>, trx?: Knex.Transaction): Promise<T> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const [result] = await query.insert(data).returning('*');
    return result as T;
  }

  async bulkCreate(data: Partial<T>[], trx?: Knex.Transaction): Promise<T[]> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const results = await query.insert(data).returning('*');
    return results as T[];
  }

  async update(id: number | string, data: Partial<T>, trx?: Knex.Transaction): Promise<T> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const [result] = await query.where({ id }).update(data).returning('*');
    return result as T;
  }

  async delete(id: number | string, trx?: Knex.Transaction): Promise<boolean> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const count = await query.where({ id }).delete();
    return count > 0;
  }

  async upsert(
    data: Partial<T>,
    conflictColumns: string[],
    trx?: Knex.Transaction
  ): Promise<T> {
    const query = trx ? trx(this.tableName) : this.knex(this.tableName);
    const [result] = await query
      .insert(data)
      .onConflict(conflictColumns)
      .merge()
      .returning('*');
    return result as T;
  }
}
