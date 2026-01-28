"use client";

/**
 * SharedShell Component
 *
 * Shell for shared routes (chat, notifications, auth/settings).
 * For Stage 1: Provides basic header/footer navigation.
 * For Stage 2: Will detect role and render appropriate shell with sidebar.
 */

import { PublicHeader } from "../jobs/PublicHeader";
import { PublicFooter } from "../jobs/PublicFooter";

interface SharedShellProps {
  children: React.ReactNode;
}

export function SharedShell({ children }: SharedShellProps) {
  // Stage 1: Simple header/footer layout
  // Stage 2: Will add role detection to render CandidateShell or CompanyShell
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
