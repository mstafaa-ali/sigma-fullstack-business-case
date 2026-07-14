import React from 'react';
import { Bell, ChevronDown, UserCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-bg-primary flex items-center justify-end px-8 z-10 sticky top-0 transition-colors">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-bg-card"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="text-text-secondary hover:text-text-primary transition-colors relative p-2 rounded-full hover:bg-bg-card">
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent-primary ring-2 ring-bg-primary" />
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-border-subtle/50">
          <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-white shadow-sm dark:bg-gray-700 dark:border-gray-600">
            <UserCircle className="h-9 w-9 text-gray-400 dark:text-gray-300" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-text-primary">Admin</span>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </div>
        </div>
      </div>
    </header>
  );
}
