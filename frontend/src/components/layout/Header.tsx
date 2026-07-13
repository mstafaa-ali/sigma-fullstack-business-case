import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex-1 flex items-center">
        {/* Optional Search */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border-subtle rounded-md leading-5 bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:bg-bg-primary focus:border-border-hover focus:ring-1 focus:ring-border-hover sm:text-sm transition-colors"
            placeholder="Search..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors relative">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-accent-error ring-2 ring-bg-primary" />
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        
        <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-bg-card transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center">
            <span className="text-sm font-medium text-white">AD</span>
          </div>
          <span className="text-sm font-medium text-text-primary hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
