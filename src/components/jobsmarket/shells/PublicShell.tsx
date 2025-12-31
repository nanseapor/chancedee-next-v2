'use client';

import { PublicHeader } from '../jobs/PublicHeader';
import { PublicFooter } from '../jobs/PublicFooter';

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
