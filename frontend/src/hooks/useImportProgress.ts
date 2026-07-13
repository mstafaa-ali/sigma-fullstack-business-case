import { useState, useEffect } from 'react';
import { useSSE } from './useSSE';
import { ImportSessionStatus } from '../types/import.types';

export interface ProgressState {
  status: ImportSessionStatus;
  progress: number;
  message: string;
  totalRows?: number;
  processedRows?: number;
}

export function useImportProgress(sessionId: string | null) {
  const [progressState, setProgressState] = useState<ProgressState>({
    status: 'pending',
    progress: 0,
    message: 'Waiting to start...',
  });

  const { lastEvent, isConnected, disconnect } = useSSE(
    sessionId ? `/api/import/sessions/${sessionId}/progress` : null
  );

  useEffect(() => {
    if (lastEvent) {
      const { type, data } = lastEvent;

      if (type === 'progress') {
        setProgressState({
          status: data.status,
          progress: data.progress,
          message: data.message,
          totalRows: data.totalRows,
          processedRows: data.processedRows,
        });
      } else if (type === 'completed') {
        setProgressState(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          message: 'Process completed successfully',
        }));
        disconnect();
      } else if (type === 'error') {
        setProgressState(prev => ({
          ...prev,
          status: 'failed',
          message: data.message || 'An error occurred',
        }));
        disconnect();
      }
    }
  }, [lastEvent, disconnect]);

  return { progressState, isConnected };
}
