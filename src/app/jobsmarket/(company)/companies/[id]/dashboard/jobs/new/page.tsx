import { Suspense } from "react";
import { redirect } from "next/navigation";
import { JobWizardClient } from "./_components/JobWizardClient";
import { WizardSkeleton } from "./_components/WizardSkeleton";
import { requireCompanyMember } from "@/lib/auth/route-guards";
import type { CompanyRole } from "@/types/jobsmarket/company";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ draftId?: string; duplicateFrom?: string }>;
}

/**
 * Roles allowed to post jobs (per COMP-R00 Section 4.2 Permission Matrix)
 * - admin: Full access
 * - hr_manager: Can manage jobs
 * - recruiter: Can post and edit jobs
 * - interviewer: NO job posting permission
 * - viewer: NO job posting permission
 */
const ROLES_WITH_POST_PERMISSION: CompanyRole[] = ["admin", "hr_manager", "recruiter"];

/**
 * New Job Page
 * Route: /jobsmarket/companies/[id]/dashboard/jobs/new
 *
 * Access Control (per COMP-R06 RIS Section 9.1):
 * 1. User must be authenticated (handled by requireCompanyMember)
 * 2. User must be a company member (handled by requireCompanyMember)
 * 3. Company must be approved (handled by dashboard layout)
 * 4. User must have post_jobs permission (admin, hr_manager, recruiter)
 *
 * Query params:
 * - draftId: Resume editing an existing draft
 * - duplicateFrom: Duplicate an existing job
 */
export default async function NewJobPage({
  params,
  searchParams,
}: PageProps) {
  const { id: companyId } = await params;
  const { draftId, duplicateFrom } = await searchParams;

  // Server-side auth check: verifies authentication, membership, and returns role
  // Note: The dashboard layout also runs this, but we need the claims to get userId
  const { claims, role } = await requireCompanyMember(companyId);
  const userId = claims.uid;

  // Permission check: only certain roles can post jobs
  if (!ROLES_WITH_POST_PERMISSION.includes(role)) {
    redirect("/403");
  }

  return (
    <Suspense fallback={<WizardSkeleton />}>
      <JobWizardClient
        companyId={companyId}
        userId={userId}
        draftId={draftId}
        duplicateFrom={duplicateFrom}
      />
    </Suspense>
  );
}

export const metadata = {
  title: "ลงประกาศงานใหม่ | ChanceDee",
  description: "สร้างประกาศรับสมัครงานใหม่",
};
