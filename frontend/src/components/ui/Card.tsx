import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-6',
        hoverable && 'glass-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
