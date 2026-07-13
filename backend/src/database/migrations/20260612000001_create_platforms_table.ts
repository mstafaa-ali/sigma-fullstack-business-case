import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('platforms', (table) => {
    table.increments('id').primary();
    table.string('source_kanal', 100).notNullable().unique();
    table.string('platform_name', 100).notNullable();
    table.string('payment_type', 50).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('platforms');
}
