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

export function StatsGrid({ totalImports, successRate, totalRows }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatsCard
        title="Total Imports"
        value={formatNumber(totalImports)}
        icon={Database}
        color="#3B82F6"
        subtitle="All time sessions"
      />
      <StatsCard
        title="Success Rate"
        value={`${successRate.toFixed(1)}%`}
        icon={CheckCircle}
        color="#10B981"
        subtitle="Completed without errors"
      />
      <StatsCard
        title="Rows Processed"
        value={formatNumber(totalRows)}
        icon={Rows}
        color="#F59E0B"
        subtitle="Total valid rows"
      />
    </div>
  );
}
