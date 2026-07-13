import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales_transformed', (table) => {
    table.decimal('marketing_omzet', 15, 2).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales_transformed', (table) => {
    table.dropColumn('marketing_omzet');
  });
}
