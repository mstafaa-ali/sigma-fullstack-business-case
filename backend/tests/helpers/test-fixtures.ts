export const mockSalesRaw = {
  id: 1,
  session_id: 'test-session',
  file_type: 'DAILY',
  row_number: 2,
  order_date: new Date('2026-06-08'),
  invoice_number: 'INV-001',
  tracking_number: 'TRK-001',
  expedition: 'JNT',
  transaction_type: 'Order',
  advertiser_source: 'ADV 1',
  platform_source: 'Shopee',
  store_source: 'SHOPEE',
  product_code: 'PR01',
  quantity: 1,
  total_per_line: 100000,
  province: 'Jawa Barat',
  note: 'RN/CO/DISC10',
  raw_data: '{}',
  status: 'pending',
  created_at: new Date(),
  updated_at: new Date()
};

export const mockProduct = {
  id: 1,
  product_code: 'PR01',
  product_name: 'Product 1',
  category: 'regular',
  created_at: new Date(),
  updated_at: new Date()
};

export const mockPlatform = {
  id: 1,
  platform_name: 'Shopee',
  created_at: new Date(),
  updated_at: new Date()
};

export const mockStore = {
  id: 1,
  store_name: 'SHOPEE',
  platform_id: 1,
  created_at: new Date(),
  updated_at: new Date()
};

export const mockAdmin = {
  id: 1,
  admin_name: 'Admin 1',
  store_id: 1,
  created_at: new Date(),
  updated_at: new Date()
};

export const mockAdvertiser = {
  id: 1,
  advertiser_name: 'ADV 1',
  created_at: new Date(),
  updated_at: new Date()
};

export const mockRegion = {
  id: 1,
  region_name: 'Jawa',
  province: 'Jawa Barat',
  created_at: new Date(),
  updated_at: new Date()
};
