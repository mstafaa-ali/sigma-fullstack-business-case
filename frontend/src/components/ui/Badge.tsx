import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-bg-secondary text-text-secondary border-border-subtle',
    success: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
    warning: 'bg-accent-warning/10 text-accent-warning border-accent-warning/20',
    error: 'bg-accent-error/10 text-accent-error border-accent-error/20',
    info: 'bg-accent-info/10 text-accent-info border-accent-info/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
