import { db } from '../../config/database';

export class DashboardService {
  async getStats(year?: number) {
    const yearCondition = year ? `WHERE EXTRACT(YEAR FROM order_date) = ${Number(year)}` : '';
    
    const [
      importsResult,
      rowsResult,
      omzetResult,
      successRateResult,
      recentImportsResult,
      chartDataResult,
      availableYearsResult
    ] = await Promise.all([
      db('import_sessions').count('* as count').first(),
      db('import_sessions').sum('total_rows as total').first(),
      db('sales_transformed').sum('omzet as total').first(),
      db.raw(`
        SELECT COALESCE(SUM(success_rows)::float / NULLIF(SUM(total_rows), 0) * 100, 0) as rate 
        FROM import_sessions
      `),
      db('import_sessions')
        .select('id', 'created_at as createdAt', 'status', 'total_rows as totalRows', 'success_rows as validRows', 'error_rows as invalidRows')
        .orderBy('created_at', 'desc')
        .limit(5),
      db.raw(`
        SELECT TO_CHAR(order_date, 'YYYY-MM') as date, SUM(omzet) as omzet 
        FROM sales_transformed 
        ${yearCondition}
        GROUP BY date 
        ORDER BY date ASC
      `),
      db.raw(`
        SELECT DISTINCT EXTRACT(YEAR FROM order_date)::integer as year
        FROM sales_transformed
        ORDER BY year DESC
      `)
    ]);

    return {
      totalImports: Number(importsResult?.count || 0),
      totalRowsProcessed: Number(rowsResult?.total || 0),
      totalSalesOmzet: Number(omzetResult?.total || 0),
      successRate: Number(successRateResult?.rows?.[0]?.rate || 0),
      recentImports: recentImportsResult,
      chartData: chartDataResult?.rows || [],
      availableYears: (availableYearsResult?.rows || []).map((r: any) => r.year)
    };
  }
}

export const dashboardService = new DashboardService();
