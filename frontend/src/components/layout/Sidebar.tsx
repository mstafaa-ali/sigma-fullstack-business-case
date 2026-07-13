import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, History, Database } from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload Data', href: '/upload', icon: UploadCloud },
  { name: 'History', href: '/history', icon: History },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border-subtle bg-bg-secondary flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Database className="text-accent-primary" size={24} />
          <span className="text-lg font-bold text-white tracking-wide">
            SIGMA<span className="text-accent-primary">.SYS</span>
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                    isActive ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border-subtle">
        <div className="px-3 py-2 text-xs text-text-muted text-center">
          v1.0.0 &copy; 2026
        </div>
      </div>
    </aside>
  );
}
