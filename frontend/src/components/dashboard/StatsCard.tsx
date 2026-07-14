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
      className="bg-bg-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-border-subtle p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <div
        className="p-4 rounded-full flex-shrink-0"
        style={{ background: `${color || 'var(--color-accent-primary)'}15` }}
      >
        <Icon size={24} style={{ color: color || 'var(--color-accent-primary)' }} />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-text-primary leading-tight">
          {value}
        </h2>
        <p className="text-text-secondary text-sm font-medium mt-0.5">
          {title}
        </p>
      </div>
    </div>
  );
}
