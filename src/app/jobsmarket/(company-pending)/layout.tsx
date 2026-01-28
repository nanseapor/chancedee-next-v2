import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Jobs",
    default: "รอการอนุมัติ | ChanceDee Jobs",
  },
};

/**
 * Company pending routes layout
 *
 * For companies in pending/rejected status.
 * MinimalShell is applied inline in PendingClient based on company status.
 */
export default function CompanyPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
