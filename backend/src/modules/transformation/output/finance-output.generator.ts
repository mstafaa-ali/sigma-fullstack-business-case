import ExcelJS from 'exceljs';
import { SalesTransformedRepository } from '../../sales/sales-transformed.repository';


const FINANCE_COLUMNS = [
  'Tanggal Closing',
  'Tanggal Pesanan',
  'No. Invoice',
  'No Resi',
  'Ekspedisi',
  'Type Transaksi',
  'Advertiser',
  'Platform',
  'Nama Toko',
  'Admin',
  'Produk Name',
  'Jumlah',
  'Omzet',
  'HPP Sigma',
  'TaxName(%)',
  'Total Bayar',
  'Payment type',
];

export class FinanceOutputGenerator {
  constructor(
    private salesTransformedRepo: SalesTransformedRepository
  ) {}

  private formatDate(input: Date | null | string): string {
    if (!input) return '';
    const date = typeof input === 'string' ? new Date(input) : input;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async generate(sessionId: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Header
    worksheet.addRow(FINANCE_COLUMNS);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    // Data
    // We fetch all rows for a session ordered by row_number
    const { data: rows } = await this.salesTransformedRepo.findBySessionId(sessionId, {
      limit: 100000,
    });
    
    // For large datasets, a streaming approach would be better, but this handles reasonable sizes.
    // If needed we can fetch iteratively, but for now we fetch up to 100000.

    for (const row of rows) {
      worksheet.addRow([
        this.formatDate(row.closing_date),          // Tanggal Closing
        this.formatDate(row.order_date),            // Tanggal Pesanan
        row.invoice_number,         // No. Invoice
        row.tracking_number,        // No Resi
        row.expedition,             // Ekspedisi
        row.transaction_type,       // Type Transaksi
        row.advertiser_name,        // Advertiser
        row.platform_name,          // Platform
        row.store_name,             // Nama Toko
        row.admin_name,             // Admin
        row.product_name,           // Produk Name
        row.quantity,               // Jumlah
        row.omzet,                  // Omzet
        row.hpp,                    // HPP Sigma
        row.promo_code,             // TaxName(%)
        row.total_bayar,            // Total Bayar
        row.payment_type,           // Payment type
      ]);
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 10;
        if (length > maxLength) maxLength = length;
      });
      column.width = Math.min(maxLength + 2, 30);
    });

    return await workbook.xlsx.writeBuffer() as any as Buffer;
  }
}
