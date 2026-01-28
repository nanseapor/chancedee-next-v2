import type { Metadata } from "next";
import { PublicHeader } from "@/components/jobsmarket/jobs/PublicHeader";
import { PublicFooter } from "@/components/jobsmarket/jobs/PublicFooter";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Jobs",
    default: "ChanceDee Jobs - หางาน สมัครงาน",
  },
};

/**
 * Public routes layout
 *
 * Provides consistent header/footer for all public pages:
 * - Homepage (/), Jobs (/jobs), Companies (/companies), Privacy (/privacy)
 *
 * No container wrapper - each page handles its own content width.
 * This allows homepage to have full-width hero sections.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
