import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { importApi } from '../../api/import.api';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { TransformedRow } from '../../types/import.types';
import { Button } from '../ui/Button';

interface TransactionPreviewProps {
  sessionId: string;
}

export function TransactionPreview({ sessionId }: TransactionPreviewProps) {
  const { data, loading, execute } = useApi(importApi.getTransformedData);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    execute(sessionId, page, limit);
  }, [sessionId, page, execute]);

  if (loading && !data) {
    return (
      <Card className="flex justify-center items-center h-64 mt-6">
        <Spinner />
      </Card>
    );
  }

  const rows: TransformedRow[] = data?.data?.data || [];
  const meta = data?.data?.meta;

  if (rows.length === 0) {
    return null;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  };

  return (
    <Card className="overflow-hidden mt-6">
      <div className="p-4 border-b border-border-light flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Transaction Preview</h3>
          <p className="text-sm text-text-secondary">Subset of transformed data ({meta?.total} total rows)</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-bg-secondary text-text-secondary uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Omzet</th>
              <th className="px-4 py-3 font-medium text-right">HPP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {rows.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-bg-secondary/50">
                <td className="px-4 py-3 font-medium">{row.invoice_number}</td>
                <td className="px-4 py-3 whitespace-nowrap">{new Date(row.order_date).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 max-w-[200px] truncate" title={row.product_name}>{row.product_name}</td>
                <td className="px-4 py-3">{row.platform_name}</td>
                <td className="px-4 py-3">{row.store_name}</td>
                <td className="px-4 py-3">{row.quantity}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.omzet)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.hpp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="p-4 border-t border-border-light flex justify-between items-center bg-bg-secondary">
          <span className="text-sm text-text-secondary">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.totalPages}
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
