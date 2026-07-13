import { BaseService } from '../shared/base.service';
import { Advertiser, AdvertiserRepository } from './advertiser.repository';
import { CreateAdvertiserDTO } from './dto/create-advertiser.dto';
import { UpdateAdvertiserDTO } from './dto/update-advertiser.dto';
import { Knex } from 'knex';

export class AdvertiserService extends BaseService<Advertiser, CreateAdvertiserDTO, UpdateAdvertiserDTO> {
  constructor(protected readonly repository: AdvertiserRepository) {
    super(repository);
  }

  async create(data: CreateAdvertiserDTO, trx?: Knex.Transaction): Promise<Advertiser> {
    const existing = await this.repository.findBySourceAdv(data.source_adv);
    if (existing) {
      throw new Error('Advertiser with this source_adv already exists');
    }
    return super.create(data, trx);
  }
}
