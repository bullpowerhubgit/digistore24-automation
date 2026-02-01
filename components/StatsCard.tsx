'use client';

import { formatCurrency, formatNumber } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon = '📊',
  prefix = '',
  suffix = '',
}: StatsCardProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  const changeColor =
    change !== undefined
      ? change > 0
        ? 'text-green-600'
        : change < 0
        ? 'text-red-600'
        : 'text-gray-600'
      : 'text-gray-600';

  const changeIcon = change !== undefined ? (change > 0 ? '↑' : change < 0 ? '↓' : '→') : '';

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>

      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">
          {prefix}
          {displayValue}
          {suffix}
        </p>
      </div>

      {change !== undefined && (
        <div className={`flex items-center text-sm ${changeColor}`}>
          <span className="mr-1">{changeIcon}</span>
          <span className="font-medium">{Math.abs(change).toFixed(1)}%</span>
          <span className="ml-1 text-gray-600">vs previous period</span>
        </div>
      )}
    </div>
  );
}
