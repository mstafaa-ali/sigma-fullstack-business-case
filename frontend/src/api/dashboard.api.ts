import { ApiResponse } from '../types/api.types';
import { DashboardStats } from '../types/dashboard.types';
import apiClient from './client';

export const dashboardApi = {
  getStats: (): Promise<{ data: ApiResponse<DashboardStats> }> => {
    return apiClient.get('/dashboard/stats');
  },
};
