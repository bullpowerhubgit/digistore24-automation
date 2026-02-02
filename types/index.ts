// Types for Digistore24 webhook events and data structures

export interface DigistoreWebhookEvent {
  event: 'on_payment' | 'on_refund' | 'on_affiliate_approved';
  data: DigistorePaymentData | DigistoreRefundData | DigistoreAffiliateData;
}

export interface DigistorePaymentData {
  order_id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  buyer_email: string;
  buyer_name: string;
  affiliate_id?: string;
  created_at: string;
  payment_method?: string;
  status: string;
}

export interface DigistoreRefundData {
  order_id: string;
  refund_amount: number;
  reason?: string;
  created_at: string;
}

export interface DigistoreAffiliateData {
  affiliate_id: string;
  name: string;
  email: string;
  status: string;
  approved_at: string;
}

export interface Sale {
  id?: string;
  order_id: string;
  product_name: string;
  amount: number;
  buyer_email: string;
  buyer_name: string;
  affiliate_id?: string;
  status: string;
  created_at: string;
}

export interface SalesStats {
  today: number;
  week: number;
  month: number;
  total: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
}

export interface Affiliate {
  id?: string;
  affiliate_id: string;
  name: string;
  email: string;
  total_sales: number;
  total_commission: number;
  created_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
