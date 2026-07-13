import { z } from 'zod';

export const SalesRawSchema = z.object({
  id: z.number().int(),
  session_id: z.string().uuid(),
  file_type: z.enum(['DAILY', 'MP', 'PRODUK']),
  row_number: z.number().int(),
  order_date: z.date().nullable(),
  invoice_number: z.string().nullable(),
  tracking_number: z.string().nullable(),
  platform_source: z.string().nullable(),
  store_source: z.string().nullable(),
  advertiser_source: z.string().nullable(),
  product_code: z.string().nullable(),
  quantity: z.number().int().nullable(),
  unit_price: z.number().nullable(),
  total_per_line: z.number().nullable(),
  expedition: z.string().nullable(),
  transaction_type: z.string().nullable(),
  note: z.string().nullable(),
  payment_method_source: z.string().nullable(),
  province: z.string().nullable(),
  raw_data: z.any().nullable(),
  status: z.enum(['pending', 'validated', 'error']),
  created_at: z.date(),
  updated_at: z.date(),
});

export type SalesRawDTO = z.infer<typeof SalesRawSchema>;
