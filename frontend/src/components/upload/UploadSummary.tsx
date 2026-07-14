import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { importApi } from '../../api/import.api';
import { useToast } from '../../hooks/useToast';

import { ImportSessionStatus } from '../../types/import.types';

interface UploadSummaryProps {
  sessionId: string;
  status?: ImportSessionStatus;
  onReset: () => void;
}

export function UploadSummary({ sessionId, status, onReset }: UploadSummaryProps) {
  const { showError } = useToast();
  const [hasErrors, setHasErrors] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the session has any error logs
    importApi.getLogs(sessionId, 1, 1)
      .then((res) => {
        const responseData = res.data?.data as any;
        const logs = responseData?.data || responseData || [];
        setHasErrors(Array.isArray(logs) && logs.length > 0);
      })
      .catch(() => {
        setHasErrors(false);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleDownloadErrorLog = async () => {
    try {
      const response = await importApi.downloadErrorLog(sessionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `error-log-${sessionId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showError('Failed to download error log');
    }
  };

  const isSkipped = status === 'skipped';

  return (
    <Card className="text-center py-8">
      <div className="bg-accent-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-accent-primary" />
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-2">Import Completed</h3>
      <p className="text-text-secondary mb-8">
        {isSkipped 
          ? "All rows were skipped because they already exist in the database."
          : "Your data has been successfully processed and transformed."}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <Button
          variant="outline"
          disabled={isSkipped}
          onClick={() => window.open(`/api/import/sessions/${sessionId}/outputs/finance`, '_blank')}
          className="w-full sm:w-auto"
        >
          <FileText className="mr-2 h-4 w-4" />
          FINANCE.XLSX
        </Button>
        <Button
          variant="outline"
          disabled={isSkipped}
          onClick={() => window.open(`/api/import/sessions/${sessionId}/outputs/marketing`, '_blank')}
          className="w-full sm:w-auto"
        >
          <FileText className="mr-2 h-4 w-4" />
          MARKETING.XLSX
        </Button>
        {!loading && hasErrors && (
          <Button
            variant="ghost"
            onClick={handleDownloadErrorLog}
            className="w-full sm:w-auto text-accent-warning hover:text-accent-warning hover:bg-accent-warning/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Error Log
          </Button>
        )}
      </div>

      <Button onClick={onReset} variant="primary">
        Start New Import
      </Button>
    </Card>
  );
}
