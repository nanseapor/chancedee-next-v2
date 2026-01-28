/**
 * Admin Company Management Types
 * Extracted from admin-companies.ts for Next.js 15+ compatibility
 * "use server" files can only export async functions
 */

import type { CompanyStatus } from "@/types/jobsmarket/company/status";

export interface AdminCompanyListItem {
  id: string;
  companyName: string;
  email: string;
  status: CompanyStatus;
  profilePhoto: string | null;
  industry?: string;
  createdAt: Date;
}

export interface AdminCompanyCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

export interface GetAdminCompaniesOptions {
  status?: CompanyStatus;
  search?: string;
  limit?: number;
  startAfter?: string;
}

export interface GetAdminCompaniesResult {
  success: boolean;
  data?: {
    companies: AdminCompanyListItem[];
    counts: AdminCompanyCounts;
    hasMore: boolean;
    lastDocId: string | null;
  };
  error?: string;
}

export interface AdminCompanyDetail {
  id: string;
  companyName: string;
  companyNameEn: string | null;
  email: string;
  phone: string | null;
  status: CompanyStatus;
  profilePhoto: string | null;
  industry: string | null;
  companySize: string | null;
  shortDescription: string | null;
  overview: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  subDistrict: string | null;
  postCode: string | null;
  website: string | null;
  taxId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCompanyStats {
  jobCount: number;
  teamSize: number;
  applicationCount: number;
}

export interface GetAdminCompanyDetailResult {
  success: boolean;
  data?: {
    company: AdminCompanyDetail;
    stats: AdminCompanyStats;
  };
  error?: string;
  notFound?: boolean;
}
