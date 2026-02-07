/**
 * Supabase Database Query Examples
 * 
 * This file demonstrates how to use Supabase for database operations
 * including CRUD operations, filtering, sorting, and real-time subscriptions.
 */

import {
  createServerSupabaseClient,
  createClientSupabaseClient,
  saveSale,
  getSales,
  getRecentSales,
  getSalesByDateRange,
  getSalesStats,
  saveAffiliate,
  updateAffiliateStats,
} from '@/lib/supabase';

import { Sale, Affiliate } from '@/lib/types';

// ============================================================================
// SALES OPERATIONS
// ============================================================================

/**
 * Example 1: Save a new sale to the database
 */
export async function exampleSaveSale() {
  const newSale = {
    order_id: 'ORDER-12345',
    product_name: 'Premium Course',
    amount: 99.99,
    buyer_email: 'customer@example.com',
    buyer_name: 'John Doe',
    affiliate_id: 'AFF-001',
    status: 'completed',
  };

  try {
    const savedSale = await saveSale(newSale);
    console.log('Sale saved successfully:', savedSale);
    return savedSale;
  } catch (error) {
    console.error('Failed to save sale:', error);
    throw error;
  }
}

/**
 * Example 2: Get paginated list of sales
 */
export async function exampleGetSales() {
  try {
    const { data, count } = await getSales({
      limit: 20,
      page: 1,
    });

    console.log(`Found ${count} total sales`);
    console.log('Sales:', data);
    return { data, count };
  } catch (error) {
    console.error('Failed to get sales:', error);
    throw error;
  }
}

/**
 * Example 3: Get sales within a date range
 */
export async function exampleGetSalesByDateRange() {
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  try {
    const sales = await getSalesByDateRange(startDate, endDate);
    console.log(`Found ${sales.length} sales in date range`);
    console.log('Sales:', sales);
    return sales;
  } catch (error) {
    console.error('Failed to get sales by date range:', error);
    throw error;
  }
}

/**
 * Example 4: Get recent sales
 */
export async function exampleGetRecentSales() {
  try {
    const recentSales = await getRecentSales(10);
    console.log('Recent sales:', recentSales);
    return recentSales;
  } catch (error) {
    console.error('Failed to get recent sales:', error);
    throw error;
  }
}

/**
 * Example 5: Get sales statistics
 */
export async function exampleGetSalesStats() {
  try {
    const stats = await getSalesStats();
    console.log('Sales Statistics:');
    console.log('Today:', stats.today);
    console.log('Week:', stats.week);
    console.log('Month:', stats.month);
    console.log('Total:', stats.total);
    return stats;
  } catch (error) {
    console.error('Failed to get sales stats:', error);
    throw error;
  }
}

// ============================================================================
// AFFILIATE OPERATIONS
// ============================================================================

/**
 * Example 6: Save a new affiliate
 */
export async function exampleSaveAffiliate() {
  const newAffiliate = {
    affiliate_id: 'AFF-001',
    name: 'Jane Smith',
    email: 'jane@example.com',
    total_sales: 0,
    total_commission: 0,
  };

  try {
    const savedAffiliate = await saveAffiliate(newAffiliate);
    console.log('Affiliate saved successfully:', savedAffiliate);
    return savedAffiliate;
  } catch (error) {
    console.error('Failed to save affiliate:', error);
    throw error;
  }
}

/**
 * Example 7: Update affiliate statistics
 */
export async function exampleUpdateAffiliateStats() {
  const affiliateId = 'AFF-001';

  try {
    await updateAffiliateStats(affiliateId);
    console.log('Affiliate stats updated successfully');
  } catch (error) {
    console.error('Failed to update affiliate stats:', error);
    throw error;
  }
}

// ============================================================================
// ADVANCED DATABASE OPERATIONS
// ============================================================================

/**
 * Example 8: Direct database query with filtering
 */
export async function exampleFilteredQuery() {
  const supabase = createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('status', 'completed')
      .gte('amount', 50)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    console.log('Filtered sales (completed, amount >= 50):', data);
    return data;
  } catch (error) {
    console.error('Failed to execute filtered query:', error);
    throw error;
  }
}

/**
 * Example 9: Aggregate query (count and sum)
 */
export async function exampleAggregateQuery() {
  const supabase = createServerSupabaseClient();

  try {
    // Get count of sales
    const { count, error: countError } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get sum of amounts
    const { data, error: sumError } = await supabase
      .from('sales')
      .select('amount');

    if (sumError) throw sumError;

    const totalRevenue = data?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;

    console.log('Total sales count:', count);
    console.log('Total revenue:', totalRevenue);
    
    return { count, totalRevenue };
  } catch (error) {
    console.error('Failed to execute aggregate query:', error);
    throw error;
  }
}

/**
 * Example 10: Search query with pattern matching
 */
export async function exampleSearchQuery(searchTerm: string) {
  const supabase = createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .or(`product_name.ilike.%${searchTerm}%,buyer_name.ilike.%${searchTerm}%,buyer_email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Search results for "${searchTerm}":`, data);
    return data;
  } catch (error) {
    console.error('Failed to execute search query:', error);
    throw error;
  }
}

/**
 * Example 11: Bulk insert operation
 */
export async function exampleBulkInsert() {
  const supabase = createServerSupabaseClient();

  const salesData = [
    {
      order_id: 'ORDER-001',
      product_name: 'Product A',
      amount: 29.99,
      buyer_email: 'buyer1@example.com',
      buyer_name: 'Buyer One',
      status: 'completed',
    },
    {
      order_id: 'ORDER-002',
      product_name: 'Product B',
      amount: 49.99,
      buyer_email: 'buyer2@example.com',
      buyer_name: 'Buyer Two',
      status: 'completed',
    },
  ];

  try {
    const { data, error } = await supabase
      .from('sales')
      .insert(salesData)
      .select();

    if (error) throw error;

    console.log(`Successfully inserted ${data.length} sales:`, data);
    return data;
  } catch (error) {
    console.error('Failed to bulk insert:', error);
    throw error;
  }
}

/**
 * Example 12: Update operation
 */
export async function exampleUpdateSale(orderId: string, updates: Partial<Sale>) {
  const supabase = createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('sales')
      .update(updates)
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    console.log('Sale updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to update sale:', error);
    throw error;
  }
}

/**
 * Example 13: Delete operation
 */
export async function exampleDeleteSale(orderId: string) {
  const supabase = createServerSupabaseClient();

  try {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('order_id', orderId);

    if (error) throw error;

    console.log('Sale deleted successfully');
  } catch (error) {
    console.error('Failed to delete sale:', error);
    throw error;
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Example 14: Real-time subscription to sales table
 */
export function exampleRealtimeSubscription() {
  const supabase = createClientSupabaseClient();

  // Subscribe to INSERT events
  const subscription = supabase
    .channel('sales-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sales',
      },
      (payload) => {
        console.log('New sale received:', payload.new);
        // Handle new sale (e.g., update UI, send notification)
      }
    )
    .subscribe();

  console.log('Subscribed to real-time sales updates');

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
    console.log('Unsubscribed from real-time updates');
  };
}

/**
 * Example 15: Real-time subscription with filters
 */
export function exampleRealtimeSubscriptionWithFilter(minAmount: number) {
  const supabase = createClientSupabaseClient();

  const subscription = supabase
    .channel('high-value-sales')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sales',
        filter: `amount=gte.${minAmount}`,
      },
      (payload) => {
        console.log('High-value sale received:', payload.new);
        // Handle high-value sale notification
      }
    )
    .subscribe();

  console.log(`Subscribed to sales >= $${minAmount}`);

  return () => subscription.unsubscribe();
}

// Example usage:
//
// // Save a sale
// await exampleSaveSale();
//
// // Get sales with pagination
// const { data, count } = await exampleGetSales();
//
// // Get sales statistics
// const stats = await exampleGetSalesStats();
//
// // Search for sales
// const results = await exampleSearchQuery('premium');
//
// // Subscribe to real-time updates
// const unsubscribe = exampleRealtimeSubscription();
// // Later: unsubscribe();
