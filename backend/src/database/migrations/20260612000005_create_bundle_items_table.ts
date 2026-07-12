import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bundle_items', (table) => {
    table.increments('id').primary();
    table.string('bundle_code', 50).notNullable().references('product_code').inTable('products').onDelete('CASCADE');
    table.string('item_code', 50).notNullable();
    table.string('item_name', 200).notNullable();
    table.integer('sort_order').notNullable().defaultTo(1);
    table.timestamps(true, true);
    
    table.unique(['bundle_code', 'item_code']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bundle_items');
}
