import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Jobs",
    default: "ผู้สมัครงาน | ChanceDee Jobs",
  },
};

/**
 * Candidate routes layout
 *
 * Provides metadata for all candidate pages.
 * CandidateShell is applied at candidates/[id]/layout.tsx
 */
export default function CandidateRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
