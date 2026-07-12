import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('product_code', 50).notNullable().unique();
    table.string('product_name', 200).notNullable();
    table.string('category', 50).notNullable(); // 'single' or 'bundle'
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
}
