import React from 'react';
import { StatsCard } from './StatsCard';
import { Database, CheckCircle, Rows, DollarSign } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

interface StatsGridProps {
  totalImports: number;
  successRate: number;
  totalRows: number;
  totalOmzet: number;
}

export function StatsGrid({ totalImports, successRate, totalRows, totalOmzet }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Imports"
        value={formatNumber(totalImports)}
        icon={Database}
        color="var(--color-accent-info)"
        subtitle="All time sessions"
      />
      <StatsCard
        title="Success Rate"
        value={`${successRate.toFixed(1)}%`}
        icon={CheckCircle}
        color="var(--color-accent-primary)"
        subtitle="Completed without errors"
      />
      <StatsCard
        title="Rows Processed"
        value={formatNumber(totalRows)}
        icon={Rows}
        color="var(--color-accent-warning)"
        subtitle="Total valid rows"
      />
      <StatsCard
        title="Total Omzet"
        value={`Rp ${formatNumber(totalOmzet)}`}
        icon={DollarSign}
        color="var(--color-accent-secondary)"
        subtitle="Marketing omzet"
      />
    </div>
  );
}
