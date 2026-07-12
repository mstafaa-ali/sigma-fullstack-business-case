import { BaseRepository } from './base.repository';
import { Knex } from 'knex';

export abstract class BaseService<T, CreateDTO, UpdateDTO> {
  constructor(protected readonly repository: BaseRepository<T>) {}

  async findAll(options?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ data: T[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: number | string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: CreateDTO, trx?: Knex.Transaction): Promise<T> {
    return this.repository.create(data as unknown as Partial<T>, trx);
  }

  async update(id: number | string, data: UpdateDTO, trx?: Knex.Transaction): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    return this.repository.update(id, data as unknown as Partial<T>, trx);
  }

  async delete(id: number | string, trx?: Knex.Transaction): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Record with id ${id} not found`);
    }
    return this.repository.delete(id, trx);
  }
}
