import React, { useEffect, useState } from 'react';
import { SessionList } from '../components/history/SessionList';
import { useApi } from '../hooks/useApi';
import { importApi } from '../api/import.api';
import { Button } from '../components/ui/Button';
import { Filter, RefreshCw } from 'lucide-react';

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, loading, execute } = useApi(importApi.getSessions);

  useEffect(() => {
    execute(page, 10, statusFilter);
  }, [execute, page, statusFilter]);

  const handleRefresh = () => {
    execute(page, 10, statusFilter);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Import History</h1>
          <p className="text-text-secondary mt-1">Review all your previous data import sessions.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none w-full bg-bg-secondary border border-border-subtle text-text-primary text-sm rounded-md pl-10 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4 w-4 text-text-muted" />
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} isLoading={loading}>
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <SessionList
        sessions={data?.data?.data || []}
        loading={loading && !data}
      />
      
      {data?.data?.meta && data.data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-text-secondary">
            Page {page} of {data.data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.data.meta.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
