import React from 'react';
import { Card } from '../ui/Card';
import { ImportLog } from '../../types/import.types';
import { formatDate } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface LogViewerProps {
  logs: ImportLog[];
}

export function LogViewer({ logs }: LogViewerProps) {
  return (
    <Card className="h-[400px] flex flex-col p-0 overflow-hidden">
      <div className="p-4 border-b border-border-subtle bg-bg-secondary/50">
        <h3 className="text-sm font-semibold text-text-primary">Process Logs</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
        {logs.map((log) => (
          <div
            key={log.id}
            className={cn(
              "flex gap-3 p-2 rounded",
              log.level === 'error' && "bg-accent-error/10 text-accent-error",
              log.level === 'warning' && "bg-accent-warning/10 text-accent-warning",
              log.level === 'info' && "hover:bg-bg-card text-text-secondary"
            )}
          >
            <span className="text-text-muted shrink-0">
              [{formatDate(log.createdAt)}]
            </span>
            <span className={cn(
              "font-semibold shrink-0 uppercase w-12",
              log.level === 'error' && "text-accent-error",
              log.level === 'warning' && "text-accent-warning",
              log.level === 'info' && "text-accent-info"
            )}>
              {log.level}
            </span>
            <span className="break-all">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-text-muted text-center py-8">
            No logs available for this session.
          </div>
        )}
      </div>
    </Card>
  );
}
