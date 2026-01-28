import { redirect, notFound } from 'next/navigation';
import { webCompanyInformationGetById } from '@/lib/database/actions/company-information';
import CompanyLayoutClient from '../_components/CompanyLayoutClient';
import type { CompanyProfile } from '@/types/jobsmarket/company';
import { requireCompanyMember } from '@/lib/auth/route-guards';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Dashboard layout with sidebar navigation
 * Only applies to /companies/[id]/dashboard/* routes
 *
 * Authorization: Requires user to be a company member
 * - Unauthenticated users are redirected to login
 * - Non-members are redirected to 403
 * - Pending/rejected companies are redirected to pending page
 * - Suspended companies can access dashboard (limited functionality, shows banner)
 *
 * @see COMP-R00 Section 3.2 (Access Control Transition Table)
 * @see COMP-R00 Section 5.3 (Status → Route Mapping)
 */
export default async function DashboardLayout({ children, params }: LayoutProps) {
  const { id: companyId } = await params;

  // Server-side auth check - redirects if not a member
  const { role } = await requireCompanyMember(companyId);

  // Fetch company data from database
  const companyData = await webCompanyInformationGetById(companyId);

  if (!companyData) {
    notFound();
  }

  // Map FirebaseCompanyData to CompanyProfile format
  const company: CompanyProfile = {
    uid: companyData.uid,
    companyName: companyData.companyName || 'Company',
    shortDescription: companyData.shortDescription,
    industry: companyData.industry,
    overview: companyData.overview,
    taxId: companyData.taxId || '',
    website: companyData.website,
    coverPhoto: companyData.coverPhoto,
    profilePhoto: companyData.profilePhoto,
    videoLink: companyData.videoLink,
    companySize: companyData.companySize,
    benefitsDetails: companyData.benefitsDetails,
    mapLocation: companyData.mapLocation,
    status: companyData.status,
    isActive: companyData.isActive,
    staff: companyData.staff,
    createdAt: companyData.createdAt,
    updatedAt: companyData.updatedAt,
  };

  // Check company status - redirect pending/rejected to pending page
  // Note: 'suspended' companies are NOT redirected - they can access dashboard
  // with limited functionality (per COMP-R00 Section 5.3)
  if (company.status === 'pending' || company.status === 'rejected') {
    redirect(`/companies/${companyId}/pending`);
  }

  // TODO: Fetch actual badge counts from server
  const badgeCounts = {
    jobs: 0,
    applications: 0,
    team: 0,
  };

  return (
    <CompanyLayoutClient
      company={company}
      badgeCounts={badgeCounts}
      userRole={role}
    >
      {children}
    </CompanyLayoutClient>
  );
}
