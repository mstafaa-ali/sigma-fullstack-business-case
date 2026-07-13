import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const stores = await knex('stores').select('id', 'store_name');
  
  const getStoreId = (name: string) => {
    const store = stores.find(s => s.store_name === name);
    return store ? store.id : null;
  };

  await knex('admins')
    .insert([
      { admin_name: 'Putri', store_id: getStoreId('SC') },
      { admin_name: 'HANDOKO', store_id: getStoreId('TB') },
      { admin_name: 'YAYA', store_id: getStoreId('RAYA') },
    ])
    .onConflict('admin_name')
    .merge();
}
