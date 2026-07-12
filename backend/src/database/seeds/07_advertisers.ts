import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const stores = await knex('stores').select('id', 'store_name');
  
  const getStoreId = (name: string) => {
    const store = stores.find(s => s.store_name === name);
    return store ? store.id : null;
  };

  await knex('advertisers')
    .insert([
      { source_adv: 'ADV SATU', advertiser_name: 'ADV SATU', store_id: getStoreId('SC') },
      { source_adv: 'ADV DUA', advertiser_name: 'ADV DUA', store_id: getStoreId('SC') },
      { source_adv: 'ADV TIGA', advertiser_name: 'ADV TIGA', store_id: getStoreId('TB') },
      { source_adv: 'ADV EMPAT', advertiser_name: 'ADV EMPAT', store_id: getStoreId('RAYA') },
    ])
    .onConflict('source_adv')
    .merge();
}
