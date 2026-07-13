import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sales_transformed', (table) => {
    table.increments('id').primary();
    table.integer('raw_id').unsigned().references('id').inTable('sales_raw').onDelete('SET NULL');
    table.uuid('session_id').notNullable().references('id').inTable('import_sessions').onDelete('CASCADE');
    
    // Core attributes
    table.date('closing_date').nullable();
    table.date('order_date').nullable();
    table.string('invoice_number', 100).notNullable();
    table.string('tracking_number', 100).nullable();
    table.string('expedition', 200).nullable();
    table.string('transaction_type', 20).nullable();
    
    // Mapped dimensions
    table.string('advertiser_name', 100).nullable();
    table.string('platform_name', 100).nullable();
    table.string('store_name', 100).nullable();
    table.string('admin_name', 100).nullable();
    table.string('product_name', 200).nullable();
    table.string('product_code_original', 50).nullable(); // the raw code
    table.string('sku', 50).nullable(); // could be same as product_code
    table.integer('quantity').notNullable().defaultTo(1);
    
    // Computed financials
    table.decimal('omzet', 15, 2).nullable();
    table.decimal('hpp', 15, 2).nullable();
    
    // Other attributes
    table.string('promo_code', 50).nullable();
    table.decimal('total_bayar', 15, 2).nullable();
    table.string('payment_type', 50).nullable();
    
    // Derived date components
    table.integer('year').nullable();
    table.string('month_name', 20).nullable();
    
    table.text('memo').nullable();
    table.string('region', 50).nullable();
    
    // Bundle metadata
    table.boolean('is_bundle_item').defaultTo(false);
    table.string('bundle_parent_code', 50).nullable();
    
    table.integer('row_number').notNullable();
    table.timestamps(true, true);
    
    // Assuming product_name represents the final product item, and we still use row_number 
    table.unique(['session_id', 'invoice_number', 'product_name', 'product_code_original', 'row_number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sales_transformed');
}
