import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('bundle_items')
    .insert([
      { bundle_code: 'BDL01', item_code: 'BOXL_A', item_name: 'BOXL A', sort_order: 1 },
      { bundle_code: 'BDL01', item_code: 'BOXL_B', item_name: 'BOXL B', sort_order: 2 },
    ])
    .onConflict(['bundle_code', 'item_code'])
    .merge();
}
