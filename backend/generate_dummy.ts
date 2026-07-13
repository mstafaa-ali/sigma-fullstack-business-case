import ExcelJS from 'exceljs';
import path from 'path';

async function generate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('SALES PRODUK');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 25 },
    { header: 'OrderNumber', key: 'orderNumber', width: 20 },
    { header: 'Awb', key: 'awb', width: 20 },
    { header: 'Kanal', key: 'kanal', width: 15 },
    { header: 'Toko', key: 'toko', width: 20 },
    { header: 'ADV', key: 'adv', width: 15 },
    { header: 'ProductCode', key: 'productCode', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'UnitPrice', key: 'unitPrice', width: 15 },
    { header: 'Totalperline', key: 'totalPerLine', width: 15 },
    { header: 'Ekspedisi', key: 'ekspedisi', width: 15 },
    { header: 'TypeTransaksi', key: 'typeTransaksi', width: 15 },
    { header: 'Note', key: 'note', width: 20 },
    { header: 'MetodeBayar', key: 'metodeBayar', width: 15 },
    { header: 'ProvinsiCustomer', key: 'provinsiCustomer', width: 20 },
  ];

  const combinations = [
    { kanal: 'A', toko: 'SC' },
    { kanal: 'SHOPEE', toko: 'SHOPEE|raya' },
    { kanal: 'Tiktok Shop', toko: 'TIKTOK SHOP|TB' }
  ];
  
  const advs = ['ADV01', 'ADV02'];
  const products = ['PR01', 'BRG01', 'BDL01'];
  
  for (let i = 1; i <= 2000; i++) {
    const combo = combinations[Math.floor(Math.random() * combinations.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 3) + 1;
    let price = 50000;
    if (product === 'BDL01') price = 265000;
    if (product === 'PR01') price = 100000;

    // Use a formatted string like 2024-01-15 12:34:56 for Date so it's a string not ISO obj
    const m = Math.floor(Math.random() * 12) + 1;
    const d = Math.floor(Math.random() * 28) + 1;
    const dateStr = `2024-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')} 12:00:00`;

    sheet.addRow({
      date: dateStr,
      orderNumber: `INV-${10000 + i}`,
      awb: `AWB${20000 + i}`,
      kanal: combo.kanal,
      toko: combo.toko,
      adv: advs[Math.floor(Math.random() * advs.length)],
      productCode: product,
      quantity: qty,
      unitPrice: price,
      totalPerLine: price * qty,
      ekspedisi: 'JNT',
      typeTransaksi: 'Penjualan',
      note: Math.random() > 0.8 ? 'Promo123' : '',
      metodeBayar: 'COD',
      provinsiCustomer: 'JAWA BARAT'
    });
  }

  const outPath = path.join('/Users/macairm12020/Projects/business-case-fullstack-engineer/file', 'DUMMY_SALES_DATA.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Saved to', outPath);
}

generate().catch(console.error);
