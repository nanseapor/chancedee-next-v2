/**
 * Minimal shell layout for auth routes
 * Per AUTH-R01 Implementation Plan §1
 *
 * Auth routes use a minimal layout without navigation
 * to focus user attention on the auth flow
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Jobs Market",
    default: "Jobs Market",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Logo header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <a href="/jobsmarket" className="inline-block">
            <span className="text-2xl font-bold text-primary">ChanceDee</span>
            <span className="text-sm text-muted-foreground ml-2">Jobs</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ChanceDee. All rights reserved.</p>
      </footer>
    </div>
  );
}
