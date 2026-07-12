import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Performance indexes
  await knex.schema.alterTable('sales_raw', (table) => {
    table.index(['session_id', 'status'], 'idx_sales_raw_session_status');
    table.index(['invoice_number'], 'idx_sales_raw_invoice');
    table.index(['product_code'], 'idx_sales_raw_product_code');
    table.index(['order_date'], 'idx_sales_raw_order_date');
  });

  await knex.schema.alterTable('sales_transformed', (table) => {
    table.index(['session_id'], 'idx_sales_transformed_session');
    table.index(['invoice_number'], 'idx_sales_transformed_invoice');
    table.index(['platform_name'], 'idx_sales_transformed_platform');
    table.index(['order_date'], 'idx_sales_transformed_date');
  });

  await knex.schema.alterTable('import_logs', (table) => {
    table.index(['session_id', 'log_level'], 'idx_import_logs_session_level');
  });

  // Lookup indexes for master tables
  await knex.schema.alterTable('price_rules', (table) => {
    table.index(['product_code', 'platform_id'], 'idx_price_rules_lookup');
  });

  await knex.schema.alterTable('stores', (table) => {
    table.index(['source_toko'], 'idx_stores_source');
  });

  await knex.schema.alterTable('regions', (table) => {
    table.index(['province'], 'idx_regions_province');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sales_raw', (table) => {
    table.dropIndex(['session_id', 'status'], 'idx_sales_raw_session_status');
    table.dropIndex(['invoice_number'], 'idx_sales_raw_invoice');
    table.dropIndex(['product_code'], 'idx_sales_raw_product_code');
    table.dropIndex(['order_date'], 'idx_sales_raw_order_date');
  });

  await knex.schema.alterTable('sales_transformed', (table) => {
    table.dropIndex(['session_id'], 'idx_sales_transformed_session');
    table.dropIndex(['invoice_number'], 'idx_sales_transformed_invoice');
    table.dropIndex(['platform_name'], 'idx_sales_transformed_platform');
    table.dropIndex(['order_date'], 'idx_sales_transformed_date');
  });

  await knex.schema.alterTable('import_logs', (table) => {
    table.dropIndex(['session_id', 'log_level'], 'idx_import_logs_session_level');
  });

  await knex.schema.alterTable('price_rules', (table) => {
    table.dropIndex(['product_code', 'platform_id'], 'idx_price_rules_lookup');
  });

  await knex.schema.alterTable('stores', (table) => {
    table.dropIndex(['source_toko'], 'idx_stores_source');
  });

  await knex.schema.alterTable('regions', (table) => {
    table.dropIndex(['province'], 'idx_regions_province');
  });
}
