import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('price_rules', (table) => {
    table.increments('id').primary();
    table.string('product_code', 50).notNullable();
    table.integer('platform_id').unsigned().notNullable().references('id').inTable('platforms').onDelete('CASCADE');
    table.string('bundle_item_code', 50).nullable(); // Null if it's a single product
    table.decimal('hpp', 15, 2).notNullable();
    table.timestamps(true, true);
    
    // The combination of product_code, platform_id and bundle_item_code should be unique
    // For single products, bundle_item_code is null. PostgreSQL treats nulls as distinct,
    // but practically we only insert one rule per single product + platform.
    table.unique(['product_code', 'platform_id', 'bundle_item_code']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('price_rules');
}
