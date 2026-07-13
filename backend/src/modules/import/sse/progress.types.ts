export interface ProgressEvent {
  type: 'status_change' | 'progress' | 'error' | 'completed';
  status?: string;
  step?: string;
  current?: number;
  total?: number;
  processedRows?: number;
  file?: string;
  message: string;
  errors?: string[];
  timestamp?: string;
}
