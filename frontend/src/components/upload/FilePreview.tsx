import React from 'react';
import { FileSpreadsheet, X } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

export function FilePreview({ file, onRemove, disabled }: FilePreviewProps) {
  return (
    <div className="flex items-center justify-between p-4 glass-card group">
      <div className="flex items-center space-x-4">
        <div className="bg-accent-primary/10 p-2 rounded-lg">
          <FileSpreadsheet className="h-6 w-6 text-accent-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary truncate max-w-[200px] sm:max-w-xs">
            {file.name}
          </p>
          <p className="text-xs text-text-muted">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      {!disabled && (
        <button
          onClick={onRemove}
          className="p-1 rounded-md text-text-muted hover:text-accent-error hover:bg-bg-card transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Remove file"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
