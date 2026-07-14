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
        setProgressState(prev => {
          let calculatedProgress = data.progress;
          
          if (typeof calculatedProgress !== 'number') {
            if (typeof data.current === 'number' && typeof data.total === 'number' && data.total > 0) {
              calculatedProgress = (data.current / data.total) * 100;
            } else {
              // fallback to previous progress, or if it's processing step, you could just increment visually
              // for now keep the previous progress
              calculatedProgress = prev.progress;
            }
          }

          return {
            status: data.status || prev.status,
            progress: calculatedProgress || 0,
            message: data.message || prev.message,
            totalRows: data.totalRows || prev.totalRows,
            processedRows: data.processedRows || prev.processedRows,
          };
        });
      } else if (type === 'completed') {
        setProgressState(prev => ({
          ...prev,
          status: data.status || 'completed',
          progress: 100,
          message: data.message || 'Process completed successfully',
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
