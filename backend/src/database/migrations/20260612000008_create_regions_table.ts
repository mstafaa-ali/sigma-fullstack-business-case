import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('regions', (table) => {
    table.increments('id').primary();
    table.string('province', 100).notNullable().unique();
    table.string('region_name', 50).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('regions');
}
