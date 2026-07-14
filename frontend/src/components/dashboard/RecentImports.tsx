import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatDate, formatNumber } from '../../utils/formatters';
import { RecentImport } from '../../types/dashboard.types';
import { Link } from 'react-router-dom';
import { Inbox, MoreHorizontal } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';

interface RecentImportsProps {
  imports: RecentImport[];
}

export function RecentImports({ imports }: RecentImportsProps) {
  return (
    <div className="bg-bg-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border-subtle flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-border-subtle">
        <h3 className="text-lg font-semibold text-text-primary">Recent Imports</h3>
        <Link to="/history" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
          View All
        </Link>
      </div>

      {imports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            icon={Inbox}
            title="No imports yet"
            description="Start by uploading your first batch of Excel files."
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
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
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatNumber(session.totalRows)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/history/${session.id}`}
                      className="p-2 inline-flex rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
