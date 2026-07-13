import React from 'react';
import { cn } from '../../utils/cn';

export function Table({ children, className }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto w-full">
      <table className={cn("w-full text-sm text-left text-text-secondary", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("text-xs text-text-muted uppercase bg-bg-secondary/50", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-border-subtle hover:bg-bg-card/50 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={cn("px-6 py-3 font-medium text-text-primary whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-6 py-4", className)}>
      {children}
    </td>
  );
}
