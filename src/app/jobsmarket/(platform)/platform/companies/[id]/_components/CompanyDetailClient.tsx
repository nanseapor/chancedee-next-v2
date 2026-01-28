"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAdminCompanyDetail } from "@/hooks/jobsmarket/admin/use-admin-company-detail";

import { CompanyHeader } from "./CompanyHeader";
import { CompanyOverview } from "./CompanyOverview";

/**
 * CompanyDetailClient component
 * Per ADM-R02 Company Management RIS §3.2 Company Detail
 *
 * Main client component that integrates:
 * - CompanyHeader (logo, name, status, actions)
 * - CompanyOverview (contact, address, profile, stats)
 * - Loading/Error/404 states
 */

interface CompanyDetailClientProps {
  companyId: string;
}

export function CompanyDetailClient({ companyId }: CompanyDetailClientProps) {
  const router = useRouter();
  const { company, stats, isLoading, error, notFound, refresh } =
    useAdminCompanyDetail(companyId);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="space-y-6 animate-pulse"
        data-testid="company-detail-skeleton"
      >
        {/* Header skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded bg-gray-200" />
            <div className="h-16 w-16 rounded-lg bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-40 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                  <div className="h-6 w-12 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="h-6 w-32 rounded bg-gray-200 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="h-6 w-32 rounded bg-gray-200 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
        data-testid="company-detail-error"
      >
        <p className="text-red-600 mb-4">
          เกิดข้อผิดพลาดในการโหลดข้อมูลบริษัท
        </p>
        <Button onClick={refresh} variant="outline">
          ลองใหม่
        </Button>
      </div>
    );
  }

  // 404 state
  if (notFound) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white p-6 text-center"
        data-testid="company-not-found"
      >
        <p className="text-gray-600 mb-4">ไม่พบบริษัทที่ต้องการ</p>
        <Link
          href="/platform/companies"
          className="text-secondary-600 hover:text-secondary-700 hover:underline"
        >
          กลับไปยังรายการบริษัท
        </Link>
      </div>
    );
  }

  // No data (shouldn't happen but handle gracefully)
  if (!company || !stats) {
    return null;
  }

  // Action handlers (placeholders for now - will be implemented in 3D)
  const handleApprove = (companyId: string) => {
    console.log("Approve:", companyId);
    // TODO: Implement in Sub-Phase 3D
  };

  const handleReject = (companyId: string) => {
    console.log("Reject:", companyId);
    // TODO: Implement in Sub-Phase 3D
  };

  const handleSuspend = (companyId: string) => {
    console.log("Suspend:", companyId);
    // TODO: Implement in Sub-Phase 3D
  };

  const handleReactivate = (companyId: string) => {
    console.log("Reactivate:", companyId);
    // TODO: Implement in Sub-Phase 3D
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <CompanyHeader
        company={company}
        onApprove={handleApprove}
        onReject={handleReject}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onBack={handleBack}
      />

      <CompanyOverview company={company} stats={stats} />
    </div>
  );
}
