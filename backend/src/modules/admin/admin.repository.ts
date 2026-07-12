import { BaseRepository } from '../shared/base.repository';

export interface Admin {
  id: number;
  admin_name: string;
  store_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export class AdminRepository extends BaseRepository<Admin> {
  constructor() {
    super('admins');
  }

  async findByAdminName(admin_name: string): Promise<Admin | null> {
    const row = await this.knex(this.tableName).where({ admin_name }).first();
    return (row as Admin) || null;
  }
}

export const adminRepository = new AdminRepository();
