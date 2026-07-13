import { useCallback } from 'react';
import toast, { ToastOptions } from 'react-hot-toast';

export function useToast() {
  const showSuccess = useCallback((message: string, options?: ToastOptions) => {
    toast.success(message, {
      ...options,
      style: {
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-subtle)',
        ...options?.style,
      },
      iconTheme: {
        primary: 'var(--color-accent-primary)',
        secondary: 'var(--color-bg-secondary)',
      },
    });
  }, []);

  const showError = useCallback((message: string, options?: ToastOptions) => {
    toast.error(message, {
      ...options,
      style: {
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-accent-error)',
        ...options?.style,
      },
      iconTheme: {
        primary: 'var(--color-accent-error)',
        secondary: 'var(--color-bg-secondary)',
      },
    });
  }, []);
  
  const showInfo = useCallback((message: string, options?: ToastOptions) => {
    toast(message, {
      ...options,
      style: {
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-subtle)',
        ...options?.style,
      },
    });
  }, []);

  return { showSuccess, showError, showInfo };
}
