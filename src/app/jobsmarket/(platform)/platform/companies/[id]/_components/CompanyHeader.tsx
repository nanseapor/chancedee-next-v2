"use client";

import { ArrowLeft, Check, X, Pause, Play } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import type { AdminCompanyDetail } from "@/lib/database/actions/admin-companies";
import type { CompanyStatus } from "@/types/jobsmarket/company/status";

/**
 * CompanyHeader component
 * Per ADM-R02 Company Management RIS §3.2.1 Company Header
 *
 * Displays:
 * - Company logo/avatar
 * - Company name (Thai & English)
 * - Status badge
 * - Action buttons (context-sensitive)
 * - Back navigation
 */

interface CompanyHeaderProps {
  company: AdminCompanyDetail;
  onApprove: (companyId: string) => void;
  onReject: (companyId: string) => void;
  onSuspend: (companyId: string) => void;
  onReactivate: (companyId: string) => void;
  onBack: () => void;
}

const STATUS_CONFIG: Record<
  CompanyStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  pending: {
    label: "รอการอนุมัติ",
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
  },
  approved: {
    label: "อนุมัติแล้ว",
    bgClass: "bg-green-100",
    textClass: "text-green-700",
  },
  rejected: {
    label: "ไม่อนุมัติ",
    bgClass: "bg-rose-100",
    textClass: "text-rose-700",
  },
  suspended: {
    label: "ถูกระงับ",
    bgClass: "bg-rose-100",
    textClass: "text-rose-700",
  },
};

export function CompanyHeader({
  company,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onBack,
}: CompanyHeaderProps) {
  const statusConfig = STATUS_CONFIG[company.status];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        {/* Left side - Company info */}
        <div className="flex items-start gap-4">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
            aria-label="กลับ"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Logo/Avatar */}
          <div className="shrink-0">
            {company.profilePhoto ? (
              <Image
                src={company.profilePhoto}
                alt={company.companyName}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                data-testid="company-header-logo"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 text-2xl font-semibold text-gray-600"
                data-testid="company-header-avatar-fallback"
              >
                {company.companyName.charAt(0)}
              </div>
            )}
          </div>

          {/* Company names and info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {company.companyName}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}
                data-testid="company-status-badge"
              >
                {statusConfig.label}
              </span>
            </div>
            {company.companyNameEn && (
              <p className="text-sm text-gray-500">{company.companyNameEn}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">{company.email}</p>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          {company.status === "pending" && (
            <>
              <Button
                variant="default"
                onClick={() => onApprove(company.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                อนุมัติ
              </Button>
              <Button
                variant="destructive"
                onClick={() => onReject(company.id)}
              >
                <X className="mr-2 h-4 w-4" />
                ปฏิเสธ
              </Button>
            </>
          )}

          {company.status === "approved" && (
            <Button
              variant="outline"
              onClick={() => onSuspend(company.id)}
              className="text-rose-600 border-rose-300 hover:bg-rose-50"
            >
              <Pause className="mr-2 h-4 w-4" />
              ระงับ
            </Button>
          )}

          {company.status === "suspended" && (
            <Button
              variant="outline"
              onClick={() => onReactivate(company.id)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <Play className="mr-2 h-4 w-4" />
              เปิดใช้งาน
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
