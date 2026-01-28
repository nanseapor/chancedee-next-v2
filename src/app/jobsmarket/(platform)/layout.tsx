import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/route-guards";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Platform",
    default: "Platform Admin | ChanceDee",
  },
};

/**
 * Platform admin routes layout
 *
 * Provides metadata for admin pages.
 * AdminShell is applied at platform/layout.tsx
 *
 * Authorization: Requires admin role ("chancedee")
 * - Unauthenticated users are redirected to login
 * - Non-admin users are redirected to 403
 */
export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require admin role
  await requireAdmin();

  return <>{children}</>;
}
