import { BaseService } from '../shared/base.service';
import { Store, StoreRepository } from './store.repository';
import { CreateStoreDTO } from './dto/create-store.dto';
import { UpdateStoreDTO } from './dto/update-store.dto';
import { Knex } from 'knex';

export class StoreService extends BaseService<Store, CreateStoreDTO, UpdateStoreDTO> {
  constructor(protected readonly repository: StoreRepository) {
    super(repository);
  }

  async create(data: CreateStoreDTO, trx?: Knex.Transaction): Promise<Store> {
    const existing = await this.repository.findBySourceToko(data.source_toko);
    if (existing) {
      throw new Error('Store with this source_toko already exists');
    }
    return super.create(data, trx);
  }
}
