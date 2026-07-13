import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const platforms = await knex('platforms').select('id', 'platform_name');
  
  const getPlatformId = (name: string) => {
    const platform = platforms.find(p => p.platform_name === name);
    return platform ? platform.id : null;
  };

  // 175000 (FINANCE) / 190000 (MARKETING) for BOXL A
  // 93000 (FINANCE) / 90000 (MARKETING) for BOXL B
  // HPP: BOXL A = 27000, BOXL B = 22500
  
  const splits = [
    { bundle_code: 'BDL01', item_code: 'BOXL_A', platform_id: getPlatformId('WEB'), output_type: 'FINANCE', sell_price: 175000, hpp: 27000 },
    { bundle_code: 'BDL01', item_code: 'BOXL_A', platform_id: getPlatformId('WEB'), output_type: 'MARKETING', sell_price: 190000, hpp: 27000 },
    { bundle_code: 'BDL01', item_code: 'BOXL_B', platform_id: getPlatformId('WEB'), output_type: 'FINANCE', sell_price: 93000, hpp: 22500 },
    { bundle_code: 'BDL01', item_code: 'BOXL_B', platform_id: getPlatformId('WEB'), output_type: 'MARKETING', sell_price: 90000, hpp: 22500 },
    
    // TIKTOK SHOP
    { bundle_code: 'BDL01', item_code: 'BOXL_A', platform_id: getPlatformId('TIKTOK SHOP'), output_type: 'FINANCE', sell_price: 175000, hpp: 27000 },
    { bundle_code: 'BDL01', item_code: 'BOXL_A', platform_id: getPlatformId('TIKTOK SHOP'), output_type: 'MARKETING', sell_price: 190000, hpp: 27000 },
    { bundle_code: 'BDL01', item_code: 'BOXL_B', platform_id: getPlatformId('TIKTOK SHOP'), output_type: 'FINANCE', sell_price: 93000, hpp: 22500 },
    { bundle_code: 'BDL01', item_code: 'BOXL_B', platform_id: getPlatformId('TIKTOK SHOP'), output_type: 'MARKETING', sell_price: 90000, hpp: 22500 },
  ];
  
  // The table may not exist yet if they just follow standard ERD without it, but let's assume it does since we created it
  const tableExists = await knex.schema.hasTable('bundle_price_splits');
  if (tableExists) {
    // Some platforms may be null if missing, let's filter them out just in case
    const validSplits = splits.filter(s => s.platform_id !== null);
    
    if (validSplits.length > 0) {
      await knex('bundle_price_splits')
        .insert(validSplits)
        .onConflict(['bundle_code', 'item_code', 'platform_id', 'output_type'])
        .merge();
    }
  }
}
