import apiClient from './client';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import { ImportSession, ImportLog, UploadResponse } from '../types/import.types';

export const importApi = {
  upload: (data: FormData, onUploadProgress?: (progress: number) => void) => {
    return apiClient.post<ApiResponse<UploadResponse>>('/import/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      },
    });
  },

  getSessions: (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);

    return apiClient.get<ApiResponse<PaginatedResponse<ImportSession>>>(`/import/sessions?${params.toString()}`);
  },

  getSession: (id: string) => {
    return apiClient.get<ApiResponse<ImportSession>>(`/import/sessions/${id}`);
  },

  getLogs: (sessionId: string, page = 1, limit = 50) => {
    return apiClient.get<ApiResponse<PaginatedResponse<ImportLog>>>(`/import/sessions/${sessionId}/logs?page=${page}&limit=${limit}`);
  },

  downloadErrorLog: (sessionId: string) => {
    return apiClient.get(`/import/sessions/${sessionId}/logs/download`, { responseType: 'blob' });
  }
};
