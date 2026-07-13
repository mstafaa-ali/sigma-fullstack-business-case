import { AdminRepository, Admin } from '../../admin/admin.repository';

export class AdminResolver {
  // Store id to Admin mapping
  private cacheByStoreId: Map<number, Admin> = new Map();

  constructor(private repo: AdminRepository) {}

  async preload(): Promise<void> {
    const admins = await this.repo.findAll({ limit: 1000 });
    this.cacheByStoreId.clear();
    for (const admin of admins.data) {
      if (admin.store_id) {
        this.cacheByStoreId.set(admin.store_id, admin);
      }
    }
  }

  resolveByStore(storeId: number): Admin {
    if (!storeId) {
      return this.createFallback();
    }
    const admin = this.cacheByStoreId.get(storeId);
    if (!admin) {
      return this.createFallback();
    }
    return admin;
  }

  private createFallback(): Admin {
    return {
      id: 0,
      admin_name: '',
      store_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }
}
