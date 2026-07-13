import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sales_raw', (table) => {
    table.increments('id').primary();
    table.uuid('session_id').notNullable().references('id').inTable('import_sessions').onDelete('CASCADE');
    table.enum('file_type', ['DAILY', 'MP', 'PRODUK']).notNullable();
    table.integer('row_number').notNullable();
    table.date('order_date').nullable();
    table.string('invoice_number', 100).nullable();
    table.string('tracking_number', 100).nullable();
    table.string('platform_source', 100).nullable();
    table.string('store_source', 100).nullable();
    table.string('advertiser_source', 100).nullable();
    table.string('product_code', 50).nullable();
    table.integer('quantity').nullable();
    table.decimal('unit_price', 15, 2).nullable();
    table.decimal('total_per_line', 15, 2).nullable();
    table.string('expedition', 200).nullable();
    table.string('transaction_type', 20).nullable();
    table.text('note').nullable();
    table.string('payment_method_source', 50).nullable();
    table.string('province', 100).nullable();
    table.jsonb('raw_data').nullable();
    table.enum('status', ['pending', 'validated', 'error']).defaultTo('pending');
    table.timestamps(true, true);

    // Unique constraint untuk mencegah duplikasi saat re-import
    table.unique(['session_id', 'file_type', 'row_number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sales_raw');
}
