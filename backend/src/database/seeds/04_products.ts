import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('products')
    .insert([
      { product_code: 'PR01', product_name: 'PRODUK SATU', category: 'single' },
      { product_code: 'BRG01', product_name: 'BARANG SATU', category: 'single' },
      { product_code: 'BDL01', product_name: '(Bundle container)', category: 'bundle' },
    ])
    .onConflict('product_code')
    .merge();
}
