import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('import_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.enum('status', [
      'pending', 'validating', 'processing', 
      'transforming', 'generating', 'completed', 'failed'
    ]).notNullable().defaultTo('pending');
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at').nullable();
    table.integer('total_rows').defaultTo(0);
    table.integer('processed_rows').defaultTo(0);
    table.integer('success_rows').defaultTo(0);
    table.integer('error_rows').defaultTo(0);
    table.jsonb('file_names').notNullable().defaultTo('[]');
    table.string('created_by', 100).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('import_sessions');
}
