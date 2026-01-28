import type { Metadata } from "next";
import { SharedShell } from "@/components/jobsmarket/shells/SharedShell";
import { requireAuth } from "@/lib/auth/route-guards";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Jobs",
    default: "ChanceDee Jobs",
  },
};

/**
 * Shared routes layout
 *
 * Provides navigation for shared routes (chat, notifications, auth/settings).
 * Uses SharedShell which provides header/footer navigation.
 *
 * Authorization: Requires any authenticated user
 * - Unauthenticated users are redirected to login
 */
export default async function SharedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require any authenticated user
  await requireAuth();

  return <SharedShell>{children}</SharedShell>;
}
