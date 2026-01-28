/**
 * Company Detail Page
 * Per ADM-R02 Company Management RIS §3.2 Company Detail
 *
 * Displays company details for admin review and management.
 * Includes:
 * - Company information (profile, contact, address)
 * - Status badge
 * - Action buttons (approve, reject, suspend, reactivate)
 * - Company stats (jobs, team size, applications)
 */

import { CompanyDetailWithActions } from "./_components/CompanyDetailWithActions";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { id } = await params;

  return <CompanyDetailWithActions companyId={id} />;
}
