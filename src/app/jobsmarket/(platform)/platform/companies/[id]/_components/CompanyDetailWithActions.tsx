"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAdminCompanyDetail } from "@/hooks/jobsmarket/admin/use-admin-company-detail";
import { useCompanyActions } from "@/hooks/jobsmarket/admin/use-company-actions";

import { CompanyHeader } from "./CompanyHeader";
import { CompanyOverview } from "./CompanyOverview";
import { ApproveModal } from "./ApproveModal";
import { RejectModal } from "./RejectModal";
import { SuspendModal } from "./SuspendModal";
import { ReactivateModal } from "./ReactivateModal";

/**
 * CompanyDetailWithActions component
 * Per ADM-R02 Company Management RIS §3.3 Company Actions
 *
 * Extends CompanyDetailClient with action modals:
 * - ApproveModal for pending companies
 * - RejectModal for pending companies
 * - SuspendModal for approved companies
 * - ReactivateModal for suspended companies
 */

interface CompanyDetailWithActionsProps {
  companyId: string;
}

type ModalType = "approve" | "reject" | "suspend" | "reactivate" | null;

export function CompanyDetailWithActions({
  companyId,
}: CompanyDetailWithActionsProps) {
  const router = useRouter();
  const { company, stats, isLoading, error, notFound, refresh } =
    useAdminCompanyDetail(companyId);

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { approve, reject, suspend, reactivate, isLoading: actionLoading } =
    useCompanyActions({
      onSuccess: () => {
        setActiveModal(null);
        refresh();
      },
    });

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

  // Action handlers - open modals
  const handleApprove = () => {
    setActiveModal("approve");
  };

  const handleReject = () => {
    setActiveModal("reject");
  };

  const handleSuspend = () => {
    setActiveModal("suspend");
  };

  const handleReactivate = () => {
    setActiveModal("reactivate");
  };

  const handleBack = () => {
    router.back();
  };

  // Modal confirm handlers
  const handleApproveConfirm = () => {
    approve(companyId);
  };

  const handleRejectConfirm = (reason: string) => {
    reject(companyId, reason);
  };

  const handleSuspendConfirm = (reason: string, duration?: number) => {
    suspend(companyId, reason, duration);
  };

  const handleReactivateConfirm = (note: string) => {
    reactivate(companyId, note);
  };

  const handleModalCancel = () => {
    setActiveModal(null);
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

      {/* Modals */}
      <ApproveModal
        isOpen={activeModal === "approve"}
        company={{ id: company.id, companyName: company.companyName }}
        onConfirm={handleApproveConfirm}
        onCancel={handleModalCancel}
        isLoading={actionLoading}
      />

      <RejectModal
        isOpen={activeModal === "reject"}
        company={{ id: company.id, companyName: company.companyName }}
        onConfirm={handleRejectConfirm}
        onCancel={handleModalCancel}
        isLoading={actionLoading}
      />

      <SuspendModal
        isOpen={activeModal === "suspend"}
        company={{ id: company.id, companyName: company.companyName }}
        onConfirm={handleSuspendConfirm}
        onCancel={handleModalCancel}
        isLoading={actionLoading}
      />

      <ReactivateModal
        isOpen={activeModal === "reactivate"}
        company={{ id: company.id, companyName: company.companyName }}
        onConfirm={handleReactivateConfirm}
        onCancel={handleModalCancel}
        isLoading={actionLoading}
      />
    </div>
  );
}
