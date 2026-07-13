import React, { useEffect, useState } from 'react';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { RecentImports } from '../components/dashboard/RecentImports';
import { Charts } from '../components/dashboard/Charts';
import { useApi } from '../hooks/useApi';
import { dashboardApi } from '../api/dashboard.api';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import { DashboardStats } from '../types/dashboard.types';

// Mock data for initial view if API is not fully ready
const MOCK_DATA: DashboardStats = {
  totalImports: 0,
  totalRowsProcessed: 0,
  totalSalesOmzet: 0,
  successRate: 0,
  recentImports: [],
  chartData: [],
  availableYears: []
};

export function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(new Date().getFullYear());
  const { data, loading, error, execute } = useApi(dashboardApi.getStats, { showErrorToast: false });

  useEffect(() => {
    execute(selectedYear).catch(() => {
      // Ignore error, already handled by useApi
    });
  }, [execute, selectedYear]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data?.data || MOCK_DATA;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Overview of your data import processes and statistics.</p>
        </div>
      </div>

      {error && (
        <div className="bg-accent-error/10 border border-accent-error/20 p-4 rounded-lg flex items-center gap-3 text-accent-error">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Failed to load live statistics. Displaying offline data.</p>
        </div>
      )}

      <StatsGrid
        totalImports={stats.totalImports}
        successRate={stats.successRate}
        totalRows={stats.totalRowsProcessed}
        totalOmzet={stats.totalSalesOmzet}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Charts 
            data={stats.chartData} 
            availableYears={stats.availableYears}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
        <div>
          <RecentImports imports={stats.recentImports} />
        </div>
      </div>
    </div>
  );
}
