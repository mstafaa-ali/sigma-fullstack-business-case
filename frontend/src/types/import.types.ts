export type ImportSessionStatus = 'pending' | 'validating' | 'processing' | 'transforming' | 'generating' | 'completed' | 'failed' | 'partial_success' | 'skipped';

export interface ImportSession {
  id: string;
  status: ImportSessionStatus;
  startTime: string;
  endTime: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  skippedRows: number;
  errorMessage: string | null;
}

export interface ImportLog {
  id: string;
  sessionId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details: any;
  createdAt: string;
}

export interface UploadResponse {
  sessionId: string;
  message: string;
}
