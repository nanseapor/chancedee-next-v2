"use client";

import CompanyShell from '@/components/jobsmarket/company/shells/CompanyShell';
import type { CompanyProfile, CompanyRole, Permission } from '@/types/jobsmarket/company';
import { hasPermission as checkPermission } from '@/types/jobsmarket/company';

interface CompanyLayoutClientProps {
  children: React.ReactNode;
  company: CompanyProfile;
  userRole: CompanyRole;
  badgeCounts?: {
    jobs?: number;
    applications?: number;
    team?: number;
  };
}

export default function CompanyLayoutClient({
  children,
  company,
  userRole,
  badgeCounts,
}: CompanyLayoutClientProps) {
  /**
   * Check if the user has a specific permission based on their role
   * Uses the permission matrix from COMP-R00 Section 4.2
   * @see src/types/jobsmarket/company/roles.ts
   */
  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(userRole, permission);
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
