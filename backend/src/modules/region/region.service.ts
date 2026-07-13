import { BaseService } from '../shared/base.service';
import { Region, RegionRepository } from './region.repository';
import { CreateRegionDTO } from './dto/create-region.dto';
import { UpdateRegionDTO } from './dto/update-region.dto';
import { Knex } from 'knex';

export class RegionService extends BaseService<Region, CreateRegionDTO, UpdateRegionDTO> {
  constructor(protected readonly repository: RegionRepository) {
    super(repository);
  }

  async create(data: CreateRegionDTO, trx?: Knex.Transaction): Promise<Region> {
    const existing = await this.repository.findByProvince(data.province);
    if (existing) {
      throw new Error('Region with this province already exists');
    }
    return super.create(data, trx);
  }
}
