import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { ProgressState } from '../../hooks/useImportProgress';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadProgressProps {
  progressState: ProgressState;
}

export function UploadProgress({ progressState }: UploadProgressProps) {
  const { status, progress, message } = progressState;
  
  let variant: 'default' | 'success' | 'warning' | 'error' = 'default';
  if (status === 'completed') variant = 'success';
  if (status === 'failed') variant = 'error';

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
    </div>
  );
}
