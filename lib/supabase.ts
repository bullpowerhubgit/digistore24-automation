import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for browser/public use
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper functions
export async function insertSale(saleData: any) {
  if (!supabaseAdmin) {
    throw new Error('Supabase is not configured');
  }
  
  const { data, error } = await supabaseAdmin
    .from('sales')
    .insert([saleData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSale(orderId: string, updates: any) {
  if (!supabaseAdmin) {
    throw new Error('Supabase is not configured');
  }
  
  const { data, error } = await supabaseAdmin
    .from('sales')
    .update(updates)
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSales(limit = 50, offset = 0) {
  if (!supabaseAdmin) {
    return [];
  }
  
  const { data, error } = await supabaseAdmin
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getSalesStats() {
  if (!supabaseAdmin) {
    return {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
      totalCount: 0,
    };
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get today's stats
  const { data: todayData } = await supabaseAdmin
    .from('sales')
    .select('amount')
    .gte('created_at', today.toISOString())
    .eq('status', 'completed');

  // Get week's stats
  const { data: weekData } = await supabaseAdmin
    .from('sales')
    .select('amount')
    .gte('created_at', weekAgo.toISOString())
    .eq('status', 'completed');

  // Get month's stats
  const { data: monthData } = await supabaseAdmin
    .from('sales')
    .select('amount')
    .gte('created_at', monthAgo.toISOString())
    .eq('status', 'completed');

  // Get all-time stats
  const { data: totalData } = await supabaseAdmin
    .from('sales')
    .select('amount')
    .eq('status', 'completed');

  const todaySum = todayData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
  const weekSum = weekData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
  const monthSum = monthData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
  const totalSum = totalData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;

  return {
    today: todaySum,
    week: weekSum,
    month: monthSum,
    total: totalSum,
    todayCount: todayData?.length || 0,
    weekCount: weekData?.length || 0,
    monthCount: monthData?.length || 0,
    totalCount: totalData?.length || 0,
  };
}

export async function upsertAffiliate(affiliateData: any) {
  if (!supabaseAdmin) {
    throw new Error('Supabase is not configured');
  }
  
  const { data, error } = await supabaseAdmin
    .from('affiliates')
    .upsert([affiliateData], { onConflict: 'affiliate_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
