/**
 * COMP-R00: Company Data Fetchers
 *
 * Fetches company data and transforms to jobsmarket types
 * Per COMP-R00 implementation plan Phase 2
 */

"use server";

import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";
import type {
  CompanyProfile,
  CompanyStatus,
  CompanyRole,
} from "@/types/jobsmarket/company";

/**
 * Fetch company profile and transform to our type
 */
export async function fetchCompanyProfile(
  companyId: string
): Promise<CompanyProfile | null> {
  try {
    const data = await webCompanyInformationGetById(companyId);

    if (!data) return null;

    // Transform database shape to our CompanyProfile type
    return {
      uid: data.uid,
      companyName: data.companyName,
      shortDescription: data.shortDescription,
      industry: data.industry,
      overview: data.overview,
      taxId: data.taxId,
      website: data.website,
      coverPhoto: data.coverPhoto,
      profilePhoto: data.profilePhoto,
      videoLink: data.videoLink,
      companySize: data.companySize,
      benefitsDetails: data.benefitsDetails,
      mapLocation: data.mapLocation,
      status: (data.status as CompanyStatus) || "pending",
      isActive: data.isActive,
      staff: data.staff,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return null;
  }
}

/**
 * Check if user is a member of the company
 * Returns their role if member, null if not
 *
 * Data structure discovery:
 * - Company has `staff: string[]` array with user UIDs
 * - User has `companyId: string` field (optional)
 * - For MVP, we check if userId is in company.staff array
 * - Role determination: First user in staff = admin, others = member (for MVP)
 *
 * TODO Phase 3+: Implement proper role storage in company_members collection
 */
export async function fetchUserMembership(
  userId: string,
  companyId: string
): Promise<{ isMember: boolean; role: CompanyRole | null }> {
  try {
    // Fetch company to check staff array
    const company = await webCompanyInformationGetById(companyId);

    if (!company || !company.staff) {
      return { isMember: false, role: null };
    }

    // Check if user is in staff array
    const isMember = company.staff.includes(userId);

    if (!isMember) {
      return { isMember: false, role: null };
    }

    // MVP role determination:
    // - First user in staff array = admin (company owner)
    // - Others = hr_manager (can do most things except manage team)
    // TODO Phase 3+: Replace with actual role from company_members collection
    const isOwner = company.staff[0] === userId;
    const role: CompanyRole = isOwner ? "admin" : "hr_manager";

    return {
      isMember: true,
      role,
    };
  } catch (error) {
    console.error("Error fetching user membership:", error);
    return { isMember: false, role: null };
  }
}
