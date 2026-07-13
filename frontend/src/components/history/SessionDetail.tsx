import React from 'react';
import { Card } from '../ui/Card';
import { ImportSession } from '../../types/import.types';
import { formatDate, formatNumber } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Clock, Database, CheckCircle, XCircle, SkipForward } from 'lucide-react';

interface SessionDetailProps {
  session: ImportSession;
}

export function SessionDetail({ session }: SessionDetailProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="p-4 flex items-start gap-4">
        <div className="bg-bg-secondary p-3 rounded-lg">
          <Clock className="h-6 w-6 text-text-secondary" />
        </div>
        <div>
          <p className="text-sm text-text-muted mb-1">Status</p>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                session.status === 'completed'
                  ? 'success'
                  : session.status === 'partial_success'
                  ? 'warning'
                  : session.status === 'skipped'
                  ? 'default'
                  : session.status === 'failed'
                  ? 'error'
                  : 'warning'
              }
            >
              {session.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 flex items-start gap-4">
        <div className="bg-accent-info/10 p-3 rounded-lg">
          <Database className="h-6 w-6 text-accent-info" />
        </div>
        <div>
          <p className="text-sm text-text-muted mb-1">Total Rows</p>
          <p className="text-xl font-semibold text-text-primary">{formatNumber(session.totalRows)}</p>
        </div>
      </Card>
      
      <Card className="p-4 flex items-start gap-4">
        <div className="bg-accent-primary/10 p-3 rounded-lg">
          <CheckCircle className="h-6 w-6 text-accent-primary" />
        </div>
        <div>
          <p className="text-sm text-text-muted mb-1">Valid Rows</p>
          <p className="text-xl font-semibold text-accent-primary">{formatNumber(session.validRows)}</p>
        </div>
      </Card>
      
      <Card className="p-4 flex items-start gap-4">
        <div className="bg-accent-error/10 p-3 rounded-lg">
          <XCircle className="h-6 w-6 text-accent-error" />
        </div>
        <div>
          <p className="text-sm text-text-muted mb-1">Invalid Rows</p>
          <p className="text-xl font-semibold text-accent-error">{formatNumber(session.invalidRows)}</p>
        </div>
      </Card>
      
      <Card className="p-4 flex items-start gap-4">
        <div className="bg-text-muted/10 p-3 rounded-lg">
          <SkipForward className="h-6 w-6 text-text-secondary" />
        </div>
        <div>
          <p className="text-sm text-text-muted mb-1">Skipped (Dupes)</p>
          <p className="text-xl font-semibold text-text-primary">{formatNumber(session.skippedRows || 0)}</p>
        </div>
      </Card>
    </div>
  );
}
