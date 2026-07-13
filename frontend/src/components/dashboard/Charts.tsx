import React from 'react';
import { Card } from '../ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../types/dashboard.types';
import { formatNumber } from '../../utils/formatters';
import { Inbox } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface ChartsProps {
  data: ChartDataPoint[];
}

export function Charts({ data }: ChartsProps) {
  if (data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <EmptyState
          icon={Inbox}
          title="No chart data available"
          description="Upload data to see your omzet trends."
        />
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Marketing Omzet Trend</h3>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Rp ${formatNumber(value / 1000000)}M`}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                borderRadius: '8px',
              }}
              itemStyle={{ color: 'var(--color-accent-primary)' }}
              formatter={(value: number) => [`Rp ${formatNumber(value)}`, 'Omzet']}
            />
            <Area
              type="monotone"
              dataKey="omzet"
              stroke="var(--color-accent-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOmzet)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
