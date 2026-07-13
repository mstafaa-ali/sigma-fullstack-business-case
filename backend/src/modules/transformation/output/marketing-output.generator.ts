import ExcelJS from 'exceljs';
import { SalesTransformedRepository } from '../../sales/sales-transformed.repository';

const MARKETING_COLUMNS = [
  'Tahun',
  'Bulan',
  'Tanggal Closing',
  'Tanggal Pesanan',
  'No. Invoice',
  'No. Resi',
  'Memo',
  'Region',
  'Ekspedisi',
  'Advertiser',
  'Platform',
  'Nama Toko',
  'Admin',
  'Produk',
  'Jumlah',
  'Omzet',
  'HPP',
  'Kode Promo',
  'Total Bayar',
  'Metode Pembayaran',
  'SKU',
];

export class MarketingOutputGenerator {
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

    worksheet.addRow(MARKETING_COLUMNS);
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    const { data: rows } = await this.salesTransformedRepo.findBySessionId(sessionId, {
      limit: 100000,
    });

    for (const row of rows) {
      // Omzet for bundle items may differ from FINANCE
      const omzet = row.is_bundle_item && row.marketing_omzet !== undefined && row.marketing_omzet !== null
        ? row.marketing_omzet 
        : row.omzet;

      worksheet.addRow([
        row.year,                    // Tahun
        row.month_name,              // Bulan
        this.formatDate(row.closing_date), // Tanggal Closing
        this.formatDate(row.order_date),   // Tanggal Pesanan
        row.invoice_number,          // No. Invoice
        row.tracking_number,         // No. Resi
        row.memo,                    // Memo
        row.region,                  // Region
        row.expedition,              // Ekspedisi
        row.advertiser_name,         // Advertiser
        row.platform_name,           // Platform
        row.store_name,              // Nama Toko
        row.admin_name,              // Admin
        row.product_name,            // Produk
        row.quantity,                // Jumlah
        omzet,                       // Omzet (marketing-specific)
        row.hpp,                     // HPP
        row.promo_code,              // Kode Promo
        row.total_bayar,             // Total Bayar
        row.payment_type,            // Metode Pembayaran
        row.sku,                     // SKU
      ]);
    }

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
