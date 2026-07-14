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
    <aside className="w-64 bg-bg-secondary flex flex-col hidden md:flex border-r border-border-subtle/30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="h-20 flex items-center px-8">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-1.5 rounded-lg">
            <Database size={20} />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">
            SIGMA<span className="text-accent-primary">.SYS</span>
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col justify-between pb-6">
        <div>
          <nav className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-4 py-3 text-[15px] font-medium rounded-full transition-all duration-200',
                    isActive
                      ? 'bg-bg-card-alt text-text-primary shadow-sm'
                      : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'mr-3.5 flex-shrink-0 h-[18px] w-[18px] transition-colors',
                        isActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-border-subtle/30 mt-auto">
          <div className="px-3 py-2 text-xs text-text-muted text-center font-medium">
            v1.0.0 &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </aside>
  );
}
