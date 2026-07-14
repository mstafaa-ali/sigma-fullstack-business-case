import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop old check constraint and create new one with additional statuses
  await knex.raw('ALTER TABLE import_sessions DROP CONSTRAINT IF EXISTS import_sessions_status_check');
  await knex.raw(`
    ALTER TABLE import_sessions 
    ADD CONSTRAINT import_sessions_status_check 
    CHECK (status IN ('pending', 'validating', 'processing', 'transforming', 'generating', 'completed', 'failed', 'partial_success', 'skipped'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE import_sessions DROP CONSTRAINT IF EXISTS import_sessions_status_check');
  await knex.raw(`
    ALTER TABLE import_sessions 
    ADD CONSTRAINT import_sessions_status_check 
    CHECK (status IN ('pending', 'validating', 'processing', 'transforming', 'generating', 'completed', 'failed'))
  `);
}

