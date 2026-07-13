import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CONSTANTS } from '../../utils/constants';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  fileCount: number;
  disabled?: boolean;
}

export function DropZone({ onFilesAdded, fileCount, disabled }: DropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: CONSTANTS.UPLOAD_FILES_REQUIRED - fileCount,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 glass-card',
        isDragActive ? 'border-accent-primary bg-accent-primary/5' : 'border-border-subtle bg-bg-secondary/30',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-accent-primary/50'
      )}
    >
      <input {...getInputProps()} />
      <Upload
        className={cn(
          "mx-auto h-12 w-12 mb-4",
          isDragActive ? "text-accent-primary" : "text-text-muted"
        )}
      />
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {isDragActive ? 'Drop files here...' : 'Drag & Drop Excel Files'}
      </h3>
      <p className="text-sm text-text-secondary mb-2">
        Upload 3 Excel files (.xlsx, .xls) — SALES DAILY, SALES MP, SALES PRODUK
      </p>
      <p className="text-xs text-text-muted">
        {fileCount}/{CONSTANTS.UPLOAD_FILES_REQUIRED} files selected
      </p>
    </div>
  );
}
