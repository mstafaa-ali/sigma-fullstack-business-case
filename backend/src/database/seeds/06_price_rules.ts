import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const platforms = await knex('platforms').select('id', 'platform_name');
  
  const getPlatformId = (name: string) => {
    const platform = platforms.find(p => p.platform_name === name);
    return platform ? platform.id : null;
  };

  await knex('price_rules')
    .insert([
      { product_code: 'PR01', platform_id: getPlatformId('WEB'), bundle_item_code: null, hpp: 56000 },
      { product_code: 'PR01', platform_id: getPlatformId('SHOPEE'), bundle_item_code: null, hpp: 84000 },
      { product_code: 'BDL01', platform_id: getPlatformId('WEB'), bundle_item_code: 'BOXL_A', hpp: 27000 },
      { product_code: 'BDL01', platform_id: getPlatformId('TIKTOK SHOP'), bundle_item_code: 'BOXL_A', hpp: 27000 },
      { product_code: 'BDL01', platform_id: getPlatformId('WEB'), bundle_item_code: 'BOXL_B', hpp: 22500 },
      { product_code: 'BDL01', platform_id: getPlatformId('TIKTOK SHOP'), bundle_item_code: 'BOXL_B', hpp: 22500 },
      { product_code: 'BRG01', platform_id: getPlatformId('WEB'), bundle_item_code: null, hpp: 36000 },
    ])
    .onConflict(['product_code', 'platform_id', 'bundle_item_code'])
    .merge();
}
