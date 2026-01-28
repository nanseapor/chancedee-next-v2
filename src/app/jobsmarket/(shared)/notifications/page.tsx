/**
 * Notifications Page - NOTIF-R01
 *
 * Server Component that renders the notifications page.
 * Requires authentication.
 */

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/firebase/admin-auth";
import { NotificationsClient } from "./_components/NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  // Check authentication
  const session = await getSessionUser();

  if (!session) {
    redirect("/auth/login");
  }

  return <NotificationsClient />;
}
