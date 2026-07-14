import React, { useState } from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { ProgressState } from '../../hooks/useImportProgress';
import { CheckCircle2, AlertCircle, Download, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { importApi } from '../../api/import.api';
import { Button } from '../ui/Button';

interface UploadProgressProps {
  progressState: ProgressState;
  sessionId?: string | null;
  onReset?: () => void;
}

export function UploadProgress({ progressState, sessionId, onReset }: UploadProgressProps) {
  const { status, progress, message } = progressState;
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  let variant: 'default' | 'success' | 'warning' | 'error' = 'default';
  if (status === 'completed') variant = 'success';
  if (status === 'failed') variant = 'error';

  const toggleLogs = async () => {
    if (!showLogs && sessionId && logs.length === 0) {
      setLoadingLogs(true);
      try {
        const response = await importApi.getLogs(sessionId);
        // getLogs returns PaginatedResponse, assuming the logs are in data.data or similar
        // Based on backend, if it returns an array directly or paginated
        const logsData = response.data?.data?.data || response.data?.data || [];
        setLogs(Array.isArray(logsData) ? logsData : []);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoadingLogs(false);
      }
    }
    setShowLogs(!showLogs);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-text-primary">Processing Data</h3>
        {status === 'completed' && <CheckCircle2 className="h-6 w-6 text-accent-primary" />}
        {status === 'failed' && <AlertCircle className="h-6 w-6 text-accent-error" />}
      </div>
      
      <ProgressBar 
        value={progress} 
        variant={variant} 
        label={message}
        animated={status !== 'completed' && status !== 'failed'}
      />
      
      {progressState.totalRows !== undefined && progressState.processedRows !== undefined && (
        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span>Processed Rows:</span>
          <span>{progressState.processedRows.toLocaleString()} / {progressState.totalRows.toLocaleString()}</span>
        </div>
      )}

      {status === 'failed' && sessionId && (
        <div className="mt-6 pt-4 border-t border-border-subtle">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <button 
              onClick={toggleLogs}
              className="text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              {showLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showLogs ? 'Hide Error Details' : 'View Error Details'}
            </button>

            <div className="flex gap-2">
              {onReset && (
                <Button variant="secondary" size="sm" onClick={onReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              <a 
                href={`/api/import/sessions/${sessionId}/logs/download`}
                download
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-accent-error text-white hover:bg-accent-error/90 h-9 px-4 py-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Error Log
              </a>
            </div>
          </div>

          {showLogs && (
            <div className="mt-4 bg-background-surface rounded-lg border border-border-subtle p-3 max-h-60 overflow-y-auto">
              {loadingLogs ? (
                <p className="text-sm text-text-muted text-center py-4">Loading logs...</p>
              ) : logs.length > 0 ? (
                <ul className="space-y-2">
                  {logs.map((log, i) => (
                    <li key={i} className="text-sm">
                      <span className="text-accent-error font-medium">[{log.log_level?.toUpperCase()}]</span>{' '}
                      <span className="text-text-secondary">{log.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted text-center py-4">No detailed logs available.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
