import { AdminShell } from "./_components/AdminShell";

/**
 * Platform Admin Layout
 * Per ADM-R00 Cross-Cutting RIS
 *
 * Wraps all admin pages with the AdminShell component
 * which provides:
 * - Authentication/authorization guard
 * - Sidebar navigation
 * - Header with search
 * - Mobile blocking
 */

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
