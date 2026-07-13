import React from 'react';
import { Card } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatDate, formatNumber } from '../../utils/formatters';
import { RecentImport } from '../../types/dashboard.types';
import { Link } from 'react-router-dom';
import { ArrowRight, Inbox } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

interface RecentImportsProps {
  imports: RecentImport[];
}

export function RecentImports({ imports }: RecentImportsProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Recent Imports</h3>
        <Link to="/history" className="text-sm text-accent-primary hover:text-accent-secondary flex items-center transition-colors">
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      {imports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Inbox}
            title="No imports yet"
            description="Start by uploading your first batch of Excel files."
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Rows</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{formatDate(session.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      session.status === 'completed'
                        ? 'success'
                        : session.status === 'failed'
                        ? 'error'
                        : 'warning'
                    }
                  >
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatNumber(session.totalRows)}</TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/history/${session.id}`}
                    className="text-accent-primary hover:text-accent-secondary text-sm"
                  >
                    Details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
