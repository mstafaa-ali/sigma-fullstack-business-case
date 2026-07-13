import { BaseService } from '../shared/base.service';
import { ColumnMapping, ColumnMappingRepository } from './column-mapping.repository';
import { CreateColumnMappingDTO } from './dto/create-column-mapping.dto';
import { UpdateColumnMappingDTO } from './dto/update-column-mapping.dto';
import { Knex } from 'knex';

export class ColumnMappingService extends BaseService<ColumnMapping, CreateColumnMappingDTO, UpdateColumnMappingDTO> {
  constructor(protected readonly repository: ColumnMappingRepository) {
    super(repository);
  }

  async create(data: CreateColumnMappingDTO, trx?: Knex.Transaction): Promise<ColumnMapping> {
    const existing = await this.repository.findByTypeAndColumn(data.file_type, data.source_column);
    if (existing) {
      throw new Error('Column mapping for this file_type and source_column already exists');
    }
    return super.create(data, trx);
  }
}
