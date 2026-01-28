import { Suspense } from "react";
import { TeamClient } from "./_components";
import { verifySessionCookie } from "@/utils/auth";
import { Loader2 } from "lucide-react";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Loading fallback for team page
 */
function TeamLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>กำลังโหลด...</p>
      </div>
    </div>
  );
}

/**
 * COMP-R02: Team Management Page
 *
 * Features:
 * - View team members
 * - Accept/reject pending applications
 * - Change member roles
 * - Remove members
 */
export default async function TeamPage({ params }: TeamPageProps) {
  const { id: companyId } = await params;

  // Get current user ID from session
  const decodedClaims = await verifySessionCookie();
  const currentUserId = decodedClaims?.uid;

  return (
    <Suspense fallback={<TeamLoading />}>
      <TeamClient companyId={companyId} currentUserId={currentUserId} />
    </Suspense>
  );
}
