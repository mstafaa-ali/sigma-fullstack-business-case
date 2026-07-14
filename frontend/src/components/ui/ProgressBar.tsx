import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;       // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'error' | 'warning';
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  variant = 'default',
  animated = true,
  size = 'md',
}: ProgressBarProps) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
  
  const colors = {
    default: 'bg-gradient-to-r from-accent-primary to-accent-secondary',
    success: 'bg-accent-primary',
    error: 'bg-accent-error',
    warning: 'bg-accent-warning',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between mb-2 text-sm">
          {label && <span className="text-text-secondary">{label}</span>}
          {showPercentage && (
            <span className="text-text-primary font-semibold">
              {Math.round(Number(value) || 0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-bg-secondary rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            colors[variant],
            animated && value < 100 && 'animate-progress-stripe bg-[length:1rem_1rem]'
          )}
          style={{
            width: `${Math.min(Number(value) || 0, 100)}%`,
            backgroundImage: animated && (Number(value) || 0) < 100
              ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)'
              : undefined,
          }}
        />
      </div>
    </div>
  );
}
