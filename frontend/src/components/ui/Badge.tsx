import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const textVariants = {
    default: 'text-text-secondary',
    success: 'text-[#10B981]',
    warning: 'text-[#F59E0B]',
    error: 'text-[#EF4444]',
    info: 'text-[#3B82F6]',
  };

  const bgVariants = {
    default: 'bg-gray-400',
    success: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]',
    info: 'bg-[#3B82F6]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[13px] font-semibold',
        textVariants[variant],
        className
      )}
      {...props}
    >
      <span className={cn('h-2 w-2 rounded-full', bgVariants[variant])} />
      {children}
    </span>
  );
}
