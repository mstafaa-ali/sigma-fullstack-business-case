import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../types/dashboard.types';
import { formatNumber } from '../../utils/formatters';
import { Inbox } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface ChartsProps {
  data: ChartDataPoint[];
  availableYears?: number[];
  selectedYear?: number;
  onYearChange?: (year: number | undefined) => void;
}

export function Charts({ data, availableYears = [], selectedYear, onYearChange }: ChartsProps) {
  if (data.length === 0) {
    return (
      <div className="bg-bg-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border-subtle p-6 h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Marketing Omzet Trend</h3>
          {availableYears.length > 0 && (
            <select
              value={selectedYear || ''}
              onChange={(e) => onYearChange?.(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-bg-card-alt border border-border-hover text-text-primary text-sm rounded-lg focus:ring-accent-primary focus:border-accent-primary block p-2 transition-colors outline-none"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Inbox}
            title="No chart data available"
            description="Upload data to see your omzet trends for this year."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border-subtle p-6 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Marketing Omzet Trend</h3>
        {availableYears.length > 0 && (
          <select
            value={selectedYear || ''}
            onChange={(e) => onYearChange?.(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-bg-card-alt border border-border-hover text-text-primary text-sm rounded-lg focus:ring-accent-primary focus:border-accent-primary block p-2 transition-colors outline-none font-medium"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <XAxis
              dataKey="date"
              stroke="#CBD5E1"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              dy={10}
              tickFormatter={(value) => {
                if (!value) return '';
                const parts = value.split('-');
                if (parts.length === 2) {
                  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1);
                  return date.toLocaleString('default', { month: 'short' }).toLowerCase();
                }
                return value;
              }}
            />
            <YAxis
              stroke="#CBD5E1"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => (value === 0 ? '0' : `${(value / 1000000).toFixed(0)}M`)}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={true} horizontal={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#111827',
                color: '#FFFFFF',
                borderRadius: '999px',
                padding: '4px 16px',
                fontSize: '13px',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              itemStyle={{ color: '#FFFFFF', display: 'none' }}
              cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return `Rp ${formatNumber(payload[0].value as number)}`;
                }
                return label;
              }}
            />
            <Line
              type="natural"
              dataKey="omzet"
              stroke="var(--theme-text-primary)"
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--theme-text-primary)', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'var(--theme-text-primary)', stroke: 'var(--theme-bg-secondary)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
