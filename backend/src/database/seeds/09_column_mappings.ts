import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const mappings = [
    // DAILY
    { file_type: 'DAILY', source_column: 'Date', internal_field: 'order_date' },
    { file_type: 'DAILY', source_column: 'OrderNumber', internal_field: 'invoice_number' },
    { file_type: 'DAILY', source_column: 'Awb', internal_field: 'tracking_number' },
    { file_type: 'DAILY', source_column: 'Kanal', internal_field: 'platform_source' },
    { file_type: 'DAILY', source_column: 'Toko', internal_field: 'store_source' },
    { file_type: 'DAILY', source_column: 'ADV', internal_field: 'advertiser_source' },
    { file_type: 'DAILY', source_column: 'ProductCode', internal_field: 'product_code' },
    { file_type: 'DAILY', source_column: 'Quantity', internal_field: 'quantity' },
    { file_type: 'DAILY', source_column: 'UnitPrice', internal_field: 'unit_price' },
    { file_type: 'DAILY', source_column: 'Totalperline', internal_field: 'total_per_line' },
    { file_type: 'DAILY', source_column: 'Ekspedisi', internal_field: 'expedition' },
    { file_type: 'DAILY', source_column: 'TypeTransaksi', internal_field: 'transaction_type' },
    { file_type: 'DAILY', source_column: 'Note', internal_field: 'note' },
    { file_type: 'DAILY', source_column: 'MetodeBayar', internal_field: 'payment_method_source' },
    { file_type: 'DAILY', source_column: 'ProvinsiCustomer', internal_field: 'province' },
    // MP
    { file_type: 'MP', source_column: 'Date', internal_field: 'order_date' },
    { file_type: 'MP', source_column: 'OrderNumber', internal_field: 'invoice_number' },
    { file_type: 'MP', source_column: 'Awb', internal_field: 'tracking_number' },
    { file_type: 'MP', source_column: 'Kanal', internal_field: 'platform_source' },
    { file_type: 'MP', source_column: 'Toko', internal_field: 'store_source' },
    { file_type: 'MP', source_column: 'ProductCode', internal_field: 'product_code' },
    { file_type: 'MP', source_column: 'Quantity', internal_field: 'quantity' },
    { file_type: 'MP', source_column: 'UnitPrice', internal_field: 'unit_price' },
    { file_type: 'MP', source_column: 'Totalperline', internal_field: 'total_per_line' },
    { file_type: 'MP', source_column: 'Ekspedisi', internal_field: 'expedition' },
    { file_type: 'MP', source_column: 'TypeTransaksi', internal_field: 'transaction_type' },
    { file_type: 'MP', source_column: 'Note', internal_field: 'note' },
    { file_type: 'MP', source_column: 'MetodeBayar', internal_field: 'payment_method_source' },
    { file_type: 'MP', source_column: 'Province', internal_field: 'province' },
    // PRODUK
    { file_type: 'PRODUK', source_column: 'Date', internal_field: 'order_date' },
    { file_type: 'PRODUK', source_column: 'OrderNumber', internal_field: 'invoice_number' },
    { file_type: 'PRODUK', source_column: 'Awb', internal_field: 'tracking_number' },
    { file_type: 'PRODUK', source_column: 'Kanal', internal_field: 'platform_source' },
    { file_type: 'PRODUK', source_column: 'Toko', internal_field: 'store_source' },
    { file_type: 'PRODUK', source_column: 'ADV', internal_field: 'advertiser_source' },
    { file_type: 'PRODUK', source_column: 'ProductCode', internal_field: 'product_code' },
    { file_type: 'PRODUK', source_column: 'Quantity', internal_field: 'quantity' },
    { file_type: 'PRODUK', source_column: 'UnitPrice', internal_field: 'unit_price' },
    { file_type: 'PRODUK', source_column: 'Totalperline', internal_field: 'total_per_line' },
    { file_type: 'PRODUK', source_column: 'Ekspedisi', internal_field: 'expedition' },
    { file_type: 'PRODUK', source_column: 'TypeTransaksi', internal_field: 'transaction_type' },
    { file_type: 'PRODUK', source_column: 'Note', internal_field: 'note' },
    { file_type: 'PRODUK', source_column: 'MetodeBayar', internal_field: 'payment_method_source' },
    { file_type: 'PRODUK', source_column: 'ProvinsiCustomer', internal_field: 'province' },
  ];

  await knex('column_mappings')
    .insert(mappings)
    .onConflict(['file_type', 'source_column'])
    .merge();
}
