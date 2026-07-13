import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { useToast } from './useToast';

interface UseApiOptions {
  showErrorToast?: boolean;
}

export function useApi<T, P extends any[]>(
  apiFunc: (...args: P) => Promise<{ data: T }>,
  options: UseApiOptions = { showErrorToast: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  const execute = useCallback(
    async (...args: P) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: { message: string } }>;
        const errorMessage = axiosError.response?.data?.error?.message || axiosError.message || 'An unexpected error occurred';
        setError(errorMessage);
        if (options.showErrorToast) {
          showError(errorMessage);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, options.showErrorToast, showError]
  );

  return { data, loading, error, execute, setData };
}
