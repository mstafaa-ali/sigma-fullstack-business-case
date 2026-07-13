export interface FinanceRowDTO {
  closing_date: string | null;
  order_date: string | null;
  invoice_number: string;
  tracking_number: string | null;
  expedition: string | null;
  transaction_type: string | null;
  advertiser_name: string | null;
  platform_name: string | null;
  store_name: string | null;
  admin_name: string | null;
  product_name: string | null;
  quantity: number;
  omzet: number;
  hpp: number;
  promo_code: string | null;
  total_bayar: number;
  payment_type: string | null;
}
