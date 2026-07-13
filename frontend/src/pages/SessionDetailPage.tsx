import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { importApi } from '../api/import.api';
import { SessionDetail } from '../components/history/SessionDetail';
import { LogViewer } from '../components/history/LogViewer';
import { ErrorReport } from '../components/history/ErrorReport';
import { TransactionPreview } from '../components/history/TransactionPreview';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: sessionData, loading: sessionLoading, execute: fetchSession } = useApi(importApi.getSession);
  const { data: logsData, loading: logsLoading, execute: fetchLogs } = useApi(importApi.getLogs);

  useEffect(() => {
    if (id) {
      fetchSession(id);
      fetchLogs(id, 1, 100);
    }
  }, [id, fetchSession, fetchLogs]);

  if (sessionLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const session = sessionData?.data;

  if (!session) {
    return (
      <div className="text-center mt-12 animate-fade-in">
        <h2 className="text-xl font-bold text-text-primary mb-2">Session Not Found</h2>
        <p className="text-text-secondary mb-6">The import session you are looking for does not exist.</p>
        <Link to="/history">
          <Button variant="outline">Back to History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/history">
          <button className="p-2 rounded-md hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Session Details</h1>
          <p className="text-sm text-text-muted font-mono mt-1">ID: {session.id}</p>
        </div>
      </div>

      <SessionDetail session={session} />
      
      <ErrorReport 
        sessionId={session.id} 
        hasErrors={session.invalidRows > 0 || session.status === 'failed'} 
      />

      {session.status === 'completed' && <TransactionPreview sessionId={session.id} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {logsLoading ? (
            <Card className="h-[400px] flex items-center justify-center">
              <Spinner />
            </Card>
          ) : (
            <LogViewer logs={logsData?.data?.data || []} />
          )}
        </div>
        
        <div>
          <Card className="h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Generated Files</h3>
            <p className="text-sm text-text-secondary mb-6">
              Download the final transformed data outputs for this session.
            </p>
            
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start"
                disabled={session.status !== 'completed'}
                onClick={() => window.open(`/api/import/sessions/${session.id}/outputs/finance`, '_blank')}
              >
                <FileText className="mr-3 h-5 w-5 text-accent-secondary" />
                <div className="flex-1 text-left">
                  <div className="font-medium">FINANCE.XLSX</div>
                  <div className="text-xs text-text-muted font-normal">Finance Department Format</div>
                </div>
                <ExternalLink className="h-4 w-4 text-text-muted" />
              </Button>
              
              <Button
                variant="secondary"
                className="w-full justify-start"
                disabled={session.status !== 'completed'}
                onClick={() => window.open(`/api/import/sessions/${session.id}/outputs/marketing`, '_blank')}
              >
                <FileText className="mr-3 h-5 w-5 text-accent-primary" />
                <div className="flex-1 text-left">
                  <div className="font-medium">MARKETING.XLSX</div>
                  <div className="text-xs text-text-muted font-normal">Marketing Department Format</div>
                </div>
                <ExternalLink className="h-4 w-4 text-text-muted" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
