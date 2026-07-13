import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('import_sessions', (table) => {
    table.integer('skipped_rows').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('import_sessions', (table) => {
    table.dropColumn('skipped_rows');
  });
}
