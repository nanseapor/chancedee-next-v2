import { requireCompanyMember } from "@/lib/auth/route-guards";

interface CompanyPendingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Company pending routes layout
 *
 * For companies in pending/rejected status.
 *
 * Authorization: Requires user to be a company member
 * - Unauthenticated users are redirected to login
 * - Non-members are redirected to 403
 */
export default async function CompanyPendingLayout({
  children,
  params,
}: CompanyPendingLayoutProps) {
  const { id: companyId } = await params;

  // Server-side auth check - redirects if not a member
  await requireCompanyMember(companyId);

  return <>{children}</>;
}
