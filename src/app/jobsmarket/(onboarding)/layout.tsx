import type { Metadata } from "next";
import MinimalShell from "@/components/jobsmarket/company/shells/MinimalShell";
import { requireAuth } from "@/lib/auth/route-guards";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Jobs",
    default: "สร้างโปรไฟล์ | ChanceDee Jobs",
  },
};

/**
 * Onboarding routes layout
 *
 * Uses MinimalShell for candidate profile creation wizard.
 * Provides minimal navigation (logo + logout) without full sidebar.
 *
 * Authorization: Requires authenticated user
 * - Unauthenticated users are redirected to login
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require authenticated user
  await requireAuth();

  return <MinimalShell>{children}</MinimalShell>;
}
