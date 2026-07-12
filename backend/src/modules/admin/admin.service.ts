import { BaseService } from '../shared/base.service';
import { Admin, AdminRepository } from './admin.repository';
import { CreateAdminDTO } from './dto/create-admin.dto';
import { UpdateAdminDTO } from './dto/update-admin.dto';
import { Knex } from 'knex';

export class AdminService extends BaseService<Admin, CreateAdminDTO, UpdateAdminDTO> {
  constructor(protected readonly repository: AdminRepository) {
    super(repository);
  }

  async create(data: CreateAdminDTO, trx?: Knex.Transaction): Promise<Admin> {
    const existing = await this.repository.findByAdminName(data.admin_name);
    if (existing) {
      throw new Error('Admin with this admin_name already exists');
    }
    return super.create(data, trx);
  }
}
