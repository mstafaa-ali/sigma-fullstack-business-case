import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // We need platform IDs, so we query them first or map them
  const platforms = await knex('platforms').select('id', 'platform_name');
  
  const getPlatformId = (name: string) => {
    const platform = platforms.find(p => p.platform_name === name);
    return platform ? platform.id : null;
  };

  await knex('stores')
    .insert([
      { source_toko: 'SC', store_name: 'SC', platform_id: getPlatformId('WEB') },
      { source_toko: 'SHOPEE|raya', store_name: 'RAYA', platform_id: getPlatformId('SHOPEE') },
      { source_toko: 'TIKTOK SHOP|TB', store_name: 'TB', platform_id: getPlatformId('TIKTOK SHOP') },
    ])
    .onConflict('source_toko')
    .merge();
}
