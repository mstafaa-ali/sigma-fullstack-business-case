export interface DashboardStats {
  totalImports: number;
  totalRowsProcessed: number;
  totalSalesOmzet: number;
  successRate: number;
  recentImports: RecentImport[];
  chartData: ChartDataPoint[];
  availableYears: number[];
}

export interface RecentImport {
  id: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ChartDataPoint {
  date: string;
  omzet: number;
}
