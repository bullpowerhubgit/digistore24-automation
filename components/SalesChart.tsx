'use client';

import { ChartDataPoint } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SalesChartProps {
  data: ChartDataPoint[];
  timeRange?: 'week' | 'month' | 'year';
}

export default function SalesChart({ data, timeRange = 'week' }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Revenue Over Time</h3>
        <p className="text-sm text-gray-600">
          {timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last year'}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px',
            }}
            formatter={(value: any) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
