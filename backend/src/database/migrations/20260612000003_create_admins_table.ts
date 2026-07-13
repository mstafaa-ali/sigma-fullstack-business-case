import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('admins', (table) => {
    table.increments('id').primary();
    table.string('admin_name', 100).notNullable().unique();
    table.integer('store_id').unsigned().references('id').inTable('stores').onDelete('SET NULL');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('admins');
}
