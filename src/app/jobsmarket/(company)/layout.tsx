import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Jobs",
    default: "บริษัท | ChanceDee Jobs",
  },
};

/**
 * Company routes layout
 *
 * Provides metadata for all company pages.
 * - Dashboard routes use CompanyShell (via dashboard/layout.tsx)
 * - Pending routes use MinimalShell (inline in PendingClient)
 */
export default function CompanyRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
