import type { Metadata } from "next";
import { SharedShell } from "@/components/jobsmarket/shells/SharedShell";
import { requireAuth } from "@/lib/auth/route-guards";
import { webUserInfoGetById } from "@/lib/database/actions/user-info";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";
import { fetchUserMembership } from "@/lib/jobsmarket/company/fetchers";
import type { CompanyProfile, CompanyRole } from "@/types/jobsmarket/company";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanceDee Jobs",
    default: "ChanceDee Jobs",
  },
};

/**
 * Shared routes layout
 *
 * Provides navigation for shared routes (chat, notifications, auth/settings).
 * Fetches user role data server-side so SharedShell can render the correct
 * role-specific shell (CandidateShell or CompanyShell).
 *
 * Authorization: Requires any authenticated user
 * - Unauthenticated users are redirected to login
 */
export default async function SharedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require any authenticated user
  const claims = await requireAuth();
  const uid = claims.uid;

  // Fetch user info to determine roles
  let roles: string[] = [];
  let companyId: string | undefined;
  let isOnboarded = false;

  try {
    const userInfo = await webUserInfoGetById(uid);
    if (userInfo) {
      roles = userInfo.roles || [];
      companyId = userInfo.companyId;
      isOnboarded = userInfo.isOnboarded ?? false;
    }
  } catch (error) {
    console.error("[SharedLayout] Failed to fetch user info:", error);
  }

  // If user has company role + companyId, fetch company data
  let companyProfile: CompanyProfile | undefined;
  let userRole: CompanyRole | undefined;

  if (roles.includes("company") && companyId) {
    try {
      const [companyData, membership] = await Promise.all([
        webCompanyInformationGetById(companyId),
        fetchUserMembership(uid, companyId),
      ]);

      if (companyData && membership.isMember && membership.role) {
        companyProfile = {
          uid: companyData.uid,
          companyName: companyData.companyName || "Company",
          shortDescription: companyData.shortDescription,
          industry: companyData.industry,
          overview: companyData.overview,
          taxId: companyData.taxId || "",
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
        userRole = membership.role;
      }
    } catch (error) {
      console.error("[SharedLayout] Failed to fetch company data:", error);
    }
  }

  return (
    <SharedShell
      uid={uid}
      roles={roles}
      isOnboarded={isOnboarded}
      companyProfile={companyProfile}
      userRole={userRole}
    >
      {children}
    </SharedShell>
  );
}
