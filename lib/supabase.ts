import { createClient } from '@supabase/supabase-js';
import { Sale, Affiliate } from './types';

// Create Supabase client for server-side operations
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Create Supabase client for client-side operations
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Sales Operations
export async function saveSale(sale: Omit<Sale, 'id' | 'created_at'>) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('sales')
    .upsert(
      {
        order_id: sale.order_id,
        product_name: sale.product_name,
        amount: sale.amount,
        buyer_email: sale.buyer_email,
        buyer_name: sale.buyer_name,
        affiliate_id: sale.affiliate_id,
        status: sale.status,
      },
      { onConflict: 'order_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving sale:', error);
    throw new Error(`Failed to save sale: ${error.message}`);
  }

  return data;
}

export async function getSales(params: {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = createServerSupabaseClient();
  const { limit = 50, page = 1, startDate, endDate } = params;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('sales')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching sales:', error);
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

export async function getSalesByDateRange(startDate: Date, endDate: Date) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sales by date range:', error);
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }

  return data || [];
}

export async function getRecentSales(limit: number = 10) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent sales:', error);
    throw new Error(`Failed to fetch recent sales: ${error.message}`);
  }

  return data || [];
}

// Affiliate Operations
export async function saveAffiliate(affiliate: Omit<Affiliate, 'id' | 'created_at'>) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('affiliates')
    .upsert(
      {
        affiliate_id: affiliate.affiliate_id,
        name: affiliate.name,
        email: affiliate.email,
        total_sales: affiliate.total_sales,
        total_commission: affiliate.total_commission,
      },
      { onConflict: 'affiliate_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving affiliate:', error);
    throw new Error(`Failed to save affiliate: ${error.message}`);
  }

  return data;
}

export async function updateAffiliateStats(affiliateId: string) {
  const supabase = createServerSupabaseClient();

  // Get total sales and commission for this affiliate
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('amount')
    .eq('affiliate_id', affiliateId);

  if (salesError) {
    console.error('Error fetching affiliate sales:', salesError);
    throw new Error(`Failed to fetch affiliate sales: ${salesError.message}`);
  }

  const totalSales = salesData?.length || 0;
  const totalCommission = salesData?.reduce((sum, sale) => sum + (sale.amount * 0.2), 0) || 0; // Assuming 20% commission

  // Update affiliate record
  const { error: updateError } = await supabase
    .from('affiliates')
    .update({
      total_sales: totalSales,
      total_commission: totalCommission,
    })
    .eq('affiliate_id', affiliateId);

  if (updateError) {
    console.error('Error updating affiliate stats:', updateError);
    throw new Error(`Failed to update affiliate stats: ${updateError.message}`);
  }
}

// Statistics
export async function getSalesStats() {
  const supabase = createServerSupabaseClient();

  // Get total stats
  const { data: totalData, error: totalError } = await supabase
    .from('sales')
    .select('amount');

  if (totalError) {
    throw new Error(`Failed to fetch total stats: ${totalError.message}`);
  }

  const totalRevenue = totalData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
  const totalCount = totalData?.length || 0;

  // Get today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayData, error: todayError } = await supabase
    .from('sales')
    .select('amount')
    .gte('created_at', today.toISOString());

  if (todayError) {
    throw new Error(`Failed to fetch today's stats: ${todayError.message}`);
  }

  const todayRevenue = todayData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
  const todayCount = todayData?.length || 0;

  // Get week's stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: weekData, error: weekError } = await supabase
    .from('sales')
    .select('amount')
    .gte('created_at', weekAgo.toISOString());

  if (weekError) {
    throw new Error(`Failed to fetch week stats: ${weekError.message}`);
  }

  const weekRevenue = weekData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
  const weekCount = weekData?.length || 0;

  // Get month's stats
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const { data: monthData, error: monthError } = await supabase
    .from('sales')
    .select('amount')
    .gte('created_at', monthAgo.toISOString());

  if (monthError) {
    throw new Error(`Failed to fetch month stats: ${monthError.message}`);
  }

  const monthRevenue = monthData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
  const monthCount = monthData?.length || 0;

  return {
    today: { revenue: todayRevenue, count: todayCount },
    week: { revenue: weekRevenue, count: weekCount },
    month: { revenue: monthRevenue, count: monthCount },
    total: { revenue: totalRevenue, count: totalCount },
  };
}
