import { webCompanyInformationGetById } from '@/lib/database/actions/company-information';
import CompanyLayoutClient from './_components/CompanyLayoutClient';
import type { CompanyProfile } from '@/types/jobsmarket/company';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function CompanyLayout({ children, params }: LayoutProps) {
  const { id: companyId } = await params;

  // Fetch company data from database
  let company: CompanyProfile;

  try {
    const companyData = await webCompanyInformationGetById(companyId);

    if (!companyData) {
      // Company not found - use fallback for development/testing
      // TODO: In production, should call notFound() here
      company = {
        uid: companyId,
        companyName: 'Test Company',
        taxId: '',
        status: 'approved',
        isActive: true,
      };
    } else {
      // Map FirebaseCompanyData to CompanyProfile format
      company = {
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
    }
  } catch {
    // Error fetching company - use fallback for development/testing
    // TODO: In production, should call notFound() here
    company = {
      uid: companyId,
      companyName: 'Test Company',
      taxId: '',
      status: 'approved',
      isActive: true,
    };
  }

  // TODO: Fetch actual badge counts from server
  // These should come from aggregated data or real-time queries
  const badgeCounts = {
    jobs: 0, // TODO: Count active jobs for this company
    applications: 0, // TODO: Count unread applications for this company
    team: 0, // TODO: Count pending team invitations
  };

  return (
    <CompanyLayoutClient
      company={company}
      badgeCounts={badgeCounts}
    >
      {children}
    </CompanyLayoutClient>
  );
}
