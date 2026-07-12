import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('stores', (table) => {
    table.increments('id').primary();
    table.string('source_toko', 100).notNullable().unique();
    table.string('store_name', 100).notNullable();
    table.integer('platform_id').unsigned().references('id').inTable('platforms').onDelete('SET NULL');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('stores');
}
