import React from 'react';
import { Card } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ImportSession } from '../../types/import.types';
import { formatDate, formatNumber } from '../../utils/formatters';
import { EmptyState } from '../ui/EmptyState';
import { Inbox, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spinner } from '../ui/Spinner';

interface SessionListProps {
  sessions: ImportSession[];
  loading: boolean;
}

export function SessionList({ sessions, loading }: SessionListProps) {
  if (loading) {
    return (
      <Card className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Inbox}
          title="No import sessions found"
          description="You haven't imported any data yet or your filters returned no results."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Rows</TableHead>
            <TableHead className="text-right">Valid Rows</TableHead>
            <TableHead className="text-right">Invalid Rows</TableHead>
            <TableHead className="text-right">Skipped Rows</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{formatDate(session.startTime)}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-right">{formatNumber(session.totalRows)}</TableCell>
              <TableCell className="text-right text-accent-primary">{formatNumber(session.validRows)}</TableCell>
              <TableCell className="text-right text-accent-error">{formatNumber(session.invalidRows)}</TableCell>
              <TableCell className="text-right text-text-muted">{formatNumber(session.skippedRows || 0)}</TableCell>
              <TableCell className="text-right">
                <Link to={`/history/${session.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
