import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('column_mappings', (table) => {
    table.increments('id').primary();
    table.string('file_type', 50).notNullable(); // 'DAILY', 'MP', 'PRODUK'
    table.string('source_column', 100).notNullable();
    table.string('internal_field', 100).notNullable();
    table.timestamps(true, true);
    
    table.unique(['file_type', 'source_column']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('column_mappings');
}
