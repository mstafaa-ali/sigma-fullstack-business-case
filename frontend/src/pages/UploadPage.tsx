import React from 'react';
import { DropZone } from '../components/upload/DropZone';
import { FilePreview } from '../components/upload/FilePreview';
import { UploadProgress } from '../components/upload/UploadProgress';
import { UploadSummary } from '../components/upload/UploadSummary';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useFileUpload } from '../hooks/useFileUpload';
import { useImportProgress } from '../hooks/useImportProgress';
import { AlertTriangle, UploadCloud } from 'lucide-react';

export function UploadPage() {
  const { files, addFiles, removeFile, upload, uploading, sessionId, error, reset } = useFileUpload();
  const { progressState } = useImportProgress(sessionId);

  const handleUpload = () => {
    upload().catch(() => {});
  };

  const isCompleted = progressState.status === 'completed' || progressState.status === 'skipped' || progressState.status === 'partial_success';
  const isUploading = uploading || (sessionId && !isCompleted && progressState.status !== 'failed');

  if (isCompleted && sessionId) {
    return (
      <div className="max-w-3xl mx-auto mt-8 animate-fade-in">
        <UploadSummary sessionId={sessionId} status={progressState.status} onReset={reset} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Upload Data</h1>
        <p className="text-text-secondary mt-1">Upload 1 or more Excel files to begin the transformation process.</p>
      </div>

      <Card>
        {!isUploading && !sessionId ? (
          <div className="space-y-6">
            <DropZone onFilesAdded={addFiles} fileCount={files.length} />
            
            {error && (
              <div className="bg-accent-error/10 border border-accent-error/20 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-accent-error mt-0.5" />
                <p className="text-sm text-accent-error">{error}</p>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-text-primary">Selected Files</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file, idx) => (
                    <FilePreview
                      key={`${file.name}-${idx}`}
                      file={file}
                      onRemove={() => removeFile(idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={files.length === 0}
                size="lg"
              >
                <UploadCloud className="mr-2 h-5 w-5" />
                Process Files
              </Button>
            </div>
          </div>
        ) : (
          <UploadProgress progressState={progressState} sessionId={sessionId} onReset={reset} />
        )}
      </Card>
    </div>
  );
}
