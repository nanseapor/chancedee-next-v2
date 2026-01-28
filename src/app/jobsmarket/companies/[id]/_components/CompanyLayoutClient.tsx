"use client";

import CompanyShell from '@/components/jobsmarket/company/shells/CompanyShell';
import type { CompanyProfile, Permission } from '@/types/jobsmarket/company';

interface CompanyLayoutClientProps {
  children: React.ReactNode;
  company: CompanyProfile;
  badgeCounts?: {
    jobs?: number;
    applications?: number;
    team?: number;
  };
}

export default function CompanyLayoutClient({
  children,
  company,
  badgeCounts,
}: CompanyLayoutClientProps) {
  // TODO: Implement actual permission checking based on user session and company membership
  // For now, allow all permissions to enable navigation
  const hasPermission = (_permission: Permission): boolean => {
    // In production, this should check:
    // 1. User's role in this company (from company_team collection)
    // 2. Permission matrix to see if role has this permission
    // For now, return true to allow all navigation during development
    return true;
  };

  return (
    <CompanyShell
      company={company}
      hasPermission={hasPermission}
      badgeCounts={badgeCounts}
    >
      {children}
    </CompanyShell>
  );
}
