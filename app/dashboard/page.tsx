'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import SalesChart from '@/components/SalesChart';
import SalesTable from '@/components/SalesTable';
import { Sale, StatsResponse, ChartDataPoint } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await fetch('/api/digistore/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent sales
      const salesResponse = await fetch('/api/digistore/sales?limit=50&page=1');
      if (!salesResponse.ok) {
        throw new Error('Failed to fetch sales');
      }
      const salesData = await salesResponse.json();
      setSales(salesData.data || []);

      // Generate chart data from sales
      const chartDataMap = new Map<string, { revenue: number; sales: number }>();
      
      (salesData.data || []).forEach((sale: Sale) => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        const existing = chartDataMap.get(date) || { revenue: 0, sales: 0 };
        chartDataMap.set(date, {
          revenue: existing.revenue + Number(sale.amount),
          sales: existing.sales + 1,
        });
      });

      // Convert to array and sort by date
      const chartPoints: ChartDataPoint[] = Array.from(chartDataMap.entries())
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          sales: data.sales,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      setChartData(chartPoints);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Dashboard</h1>
        <p className="text-gray-600">
          Real-time overview of your Digistore24 sales and performance
        </p>
        {loading && (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Refreshing data...
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(stats?.today.revenue || 0)}
          icon="💰"
        />
        <StatsCard
          title="Today's Sales"
          value={stats?.today.count || 0}
          icon="📦"
        />
        <StatsCard
          title="This Week"
          value={formatCurrency(stats?.week.revenue || 0)}
          icon="📈"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.total.revenue || 0)}
          icon="💵"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Weekly Sales"
          value={stats?.week.count || 0}
          suffix=" sales"
          icon="🛒"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.month.revenue || 0)}
          icon="📊"
        />
        <StatsCard
          title="Total Sales"
          value={stats?.total.count || 0}
          suffix=" orders"
          icon="🎯"
        />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <SalesChart data={chartData} timeRange="month" />
      </div>

      {/* Recent Sales Table */}
      <div>
        <SalesTable sales={sales} />
      </div>

      {/* Last Updated */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Auto-refreshing every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
