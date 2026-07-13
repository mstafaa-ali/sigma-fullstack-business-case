import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('platforms')
    .insert([
      { source_kanal: 'A', platform_name: 'WEB', payment_type: 'TF' },
      { source_kanal: 'SHOPEE', platform_name: 'SHOPEE', payment_type: 'Shopee' },
      { source_kanal: 'Tiktok Shop', platform_name: 'TIKTOK SHOP', payment_type: 'Tiktok' },
    ])
    .onConflict('source_kanal')
    .merge();
}
