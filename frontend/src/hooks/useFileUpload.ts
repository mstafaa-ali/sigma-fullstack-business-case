import { useState, useCallback } from 'react';
import { importApi } from '../api/import.api';
import { CONSTANTS } from '../utils/constants';

interface UploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  sessionId: string | null;
  error: string | null;
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    files: [],
    uploading: false,
    progress: 0,
    sessionId: null,
    error: null,
  });

  const addFiles = useCallback((newFiles: File[]) => {
    setState(prev => {
      // Validate: only Excel files
      const valid = newFiles.filter(f =>
        f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
      );
      
      // Max files limit
      const combined = [...prev.files, ...valid].slice(0, CONSTANTS.UPLOAD_FILES_REQUIRED);
      return { ...prev, files: combined, error: null };
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }, []);

  const upload = useCallback(async () => {
    if (state.files.length !== CONSTANTS.UPLOAD_FILES_REQUIRED) {
      setState(prev => ({ ...prev, error: `Please upload exactly ${CONSTANTS.UPLOAD_FILES_REQUIRED} Excel files` }));
      return;
    }

    setState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));

    try {
      const formData = new FormData();
      state.files.forEach(file => formData.append('files', file));

      const response = await importApi.upload(formData, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });

      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        sessionId: response.data.data.sessionId,
      }));
      
      return response.data.data.sessionId;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: error.response?.data?.error?.message || 'Upload failed',
      }));
      throw error;
    }
  }, [state.files]);

  const reset = useCallback(() => {
    setState({
      files: [],
      uploading: false,
      progress: 0,
      sessionId: null,
      error: null,
    });
  }, []);

  return { ...state, addFiles, removeFile, upload, reset };
}
