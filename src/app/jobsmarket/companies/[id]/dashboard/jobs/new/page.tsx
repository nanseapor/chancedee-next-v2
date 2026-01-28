import { Suspense } from "react";
import { JobWizardClient } from "./_components/JobWizardClient";
import { WizardSkeleton } from "./_components/WizardSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ draftId?: string; duplicateFrom?: string }>;
}

/**
 * New Job Page
 * Route: /jobsmarket/companies/[id]/dashboard/jobs/new
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

  // TODO: Add server-side auth check
  // const session = await auth();
  // if (!session) redirect('/jobsmarket/auth/login');
  // const userId = session.user.id;

  // Temporary: Use companyId as userId for now
  const userId = companyId;

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
