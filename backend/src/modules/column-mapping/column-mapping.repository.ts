import { BaseRepository } from '../shared/base.repository';

export interface ColumnMapping {
  id: number;
  file_type: string;
  source_column: string;
  internal_field: string;
  created_at: Date;
  updated_at: Date;
}

export class ColumnMappingRepository extends BaseRepository<ColumnMapping> {
  constructor() {
    super('column_mappings');
  }

  async findByTypeAndColumn(file_type: string, source_column: string): Promise<ColumnMapping | null> {
    const row = await this.knex(this.tableName).where({ file_type, source_column }).first();
    return (row as ColumnMapping) || null;
  }

  async findByFileType(file_type: string): Promise<ColumnMapping[]> {
    return this.knex(this.tableName).where({ file_type });
  }
}

export const columnMappingRepository = new ColumnMappingRepository();
