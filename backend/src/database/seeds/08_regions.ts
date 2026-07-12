import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('regions')
    .insert([
      { province: 'Jawa Timur', region_name: 'JAWA' },
      { province: 'Jawa Barat', region_name: 'JAWA' },
      { province: 'Banten', region_name: 'JAWA' },
      { province: 'DKI Jakarta', region_name: 'JAWA' },
      { province: 'Jawa Tengah', region_name: 'JAWA' },
      { province: 'DI Yogyakarta', region_name: 'JAWA' },
    ])
    .onConflict('province')
    .merge();
}
