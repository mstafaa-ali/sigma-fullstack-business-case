import { BaseService } from '../shared/base.service';
import { Platform, PlatformRepository } from './platform.repository';
import { CreatePlatformDTO } from './dto/create-platform.dto';
import { UpdatePlatformDTO } from './dto/update-platform.dto';
import { Knex } from 'knex';

export class PlatformService extends BaseService<Platform, CreatePlatformDTO, UpdatePlatformDTO> {
  constructor(protected readonly repository: PlatformRepository) {
    super(repository);
  }

  async create(data: CreatePlatformDTO, trx?: Knex.Transaction): Promise<Platform> {
    const existing = await this.repository.findBySourceKanal(data.source_kanal);
    if (existing) {
      throw new Error('Platform with this source_kanal already exists'); // 409 Conflict handled in controller
    }
    return super.create(data, trx);
  }
}
