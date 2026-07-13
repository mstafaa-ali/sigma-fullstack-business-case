import React from 'react';
import { Button } from '../ui/Button';
import { Download, AlertTriangle } from 'lucide-react';
import { importApi } from '../../api/import.api';
import { useToast } from '../../hooks/useToast';

interface ErrorReportProps {
  sessionId: string;
  hasErrors: boolean;
}

export function ErrorReport({ sessionId, hasErrors }: ErrorReportProps) {
  const { showError } = useToast();

  const handleDownload = async () => {
    try {
      const response = await importApi.downloadErrorLog(sessionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `error-report-${sessionId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError('Failed to download error report');
    }
  };

  if (!hasErrors) return null;

  return (
    <div className="bg-accent-error/10 border border-accent-error/20 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-bg-primary rounded-full p-2">
          <AlertTriangle className="h-5 w-5 text-accent-error" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-accent-error">Data Validation Errors Found</h4>
          <p className="text-xs text-text-secondary mt-1">Some rows could not be processed due to invalid data format or missing required fields.</p>
        </div>
      </div>
      <Button variant="danger" size="sm" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download Report
      </Button>
    </div>
  );
}
