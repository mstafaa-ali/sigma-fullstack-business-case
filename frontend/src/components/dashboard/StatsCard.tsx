import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, color }: StatsCardProps) {
  return (
    <div
      className="glass-card p-6 transition-all duration-250 cursor-default hover:border-border-hover hover:shadow-glow hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-secondary text-sm mb-1">
            {title}
          </p>
          <h2
            className="text-3xl font-bold bg-clip-text text-transparent text-white"
            style={{ backgroundImage: color || 'var(--gradient-primary)' }}
          >
            {value}
          </h2>
          {subtitle && (
            <p className="text-text-muted text-xs mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ background: `${color || 'var(--color-accent-primary)'}15` }}
        >
          <Icon size={24} style={{ color: color || 'var(--color-accent-primary)' }} />
        </div>
      </div>
    </div>
  );
}
