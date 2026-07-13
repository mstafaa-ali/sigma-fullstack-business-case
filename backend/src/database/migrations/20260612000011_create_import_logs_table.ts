import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('import_logs', (table) => {
    table.increments('id').primary();
    table.uuid('session_id').notNullable().references('id').inTable('import_sessions').onDelete('CASCADE');
    table.string('file_name', 255).notNullable();
    table.integer('row_number').notNullable();
    table.enum('log_level', ['info', 'warn', 'error']).notNullable().defaultTo('info');
    table.text('message').notNullable();
    table.jsonb('raw_data').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('import_logs');
}
