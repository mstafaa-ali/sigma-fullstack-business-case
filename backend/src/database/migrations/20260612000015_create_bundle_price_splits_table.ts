import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bundle_price_splits', (table) => {
    table.increments('id').primary();
    table.string('bundle_code', 50).notNullable();
    table.string('item_code', 50).notNullable();
    table.integer('platform_id').notNullable().references('id').inTable('platforms').onDelete('CASCADE');
    table.string('output_type', 20).notNullable(); // 'FINANCE' | 'MARKETING'
    table.decimal('sell_price', 15, 2).notNullable();
    table.decimal('hpp', 15, 2).notNullable();
    table.timestamps(true, true);
    
    table.unique(['bundle_code', 'item_code', 'platform_id', 'output_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bundle_price_splits');
}
