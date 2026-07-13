import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in p-6">
      <h1 className="text-6xl font-bold text-accent-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary mb-2">Page Not Found</h2>
      <p className="text-text-secondary mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="lg">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
