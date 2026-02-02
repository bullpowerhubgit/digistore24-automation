// Digistore24 API Response Types
export interface DigistoreApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Digistore24Purchase {
  order_id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  buyer_email: string;
  buyer_name: string;
  buyer_first_name?: string;
  buyer_last_name?: string;
  affiliate_id?: string;
  status: 'completed' | 'pending' | 'refunded' | 'cancelled';
  payment_date: string;
  payment_method?: string;
  transaction_id?: string;
  custom_data?: Record<string, any>;
}

export interface DigiStore24Affiliate {
  affiliate_id: string;
  name: string;
  email: string;
  total_sales: number;
  total_commission: number;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
}

// Webhook Event Types
export interface WebhookEvent {
  event_type: 'on_payment' | 'on_refund' | 'on_affiliate_approved' | 'on_rebill';
  event_id: string;
  timestamp: string;
  data: WebhookEventData;
  signature?: string;
}

export interface WebhookEventData {
  order_id: string;
  product_id: string;
  product_name: string;
  amount: number;
  currency: string;
  buyer_email: string;
  buyer_name: string;
  affiliate_id?: string;
  status: string;
  payment_date: string;
  custom?: Record<string, any>;
}

// Database Types
export interface Sale {
  id: string;
  order_id: string;
  product_name: string;
  amount: number;
  buyer_email: string;
  buyer_name: string;
  affiliate_id?: string;
  status: string;
  created_at: string;
}

export interface Affiliate {
  id: string;
  affiliate_id: string;
  name: string;
  email: string;
  total_sales: number;
  total_commission: number;
  created_at: string;
}

// Dashboard Statistics Types
export interface DashboardStats {
  today: SalesStat;
  week: SalesStat;
  month: SalesStat;
  total: SalesStat;
  recentSales: Sale[];
  chartData: ChartDataPoint[];
}

export interface SalesStat {
  revenue: number;
  count: number;
  change?: number; // percentage change from previous period
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  sales: number;
}

// API Request/Response Types
export interface SalesQueryParams {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}

export interface StatsResponse {
  today: SalesStat;
  week: SalesStat;
  month: SalesStat;
  total: SalesStat;
  conversionRate?: number;
}

// Notification Types
export interface NotificationPayload {
  type: 'sale' | 'refund' | 'affiliate_approved';
  title: string;
  message: string;
  data: any;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

// Error Types
export class DigistoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'DigistoreError';
  }
}
