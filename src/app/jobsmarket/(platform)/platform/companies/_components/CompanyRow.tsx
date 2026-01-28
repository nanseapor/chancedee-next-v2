"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminCompanyListItem } from "@/lib/database/actions/admin-companies";
import type { CompanyStatus } from "@/types/jobsmarket/company/status";

/**
 * CompanyRow component for admin company list
 * Per ADM-R02 Company Management RIS §3.1.3 Company Row
 *
 * Displays company information with context-sensitive action buttons
 * based on the company's current status.
 */

export interface CompanyRowProps {
  company: AdminCompanyListItem;
  onClick?: () => void;
  onApprove?: (companyId: string) => void;
  onReject?: (companyId: string) => void;
  onSuspend?: (companyId: string) => void;
  onReactivate?: (companyId: string) => void;
}

const statusConfig: Record<
  CompanyStatus,
  { label: string; thaiLabel: string; bgClass: string; textClass: string }
> = {
  pending: {
    label: "Pending",
    thaiLabel: "รอการอนุมัติ",
    bgClass: "bg-amber-100",
    textClass: "text-amber-700",
  },
  approved: {
    label: "Approved",
    thaiLabel: "อนุมัติ",
    bgClass: "bg-green-100",
    textClass: "text-green-700",
  },
  rejected: {
    label: "Rejected",
    thaiLabel: "ไม่อนุมัติ",
    bgClass: "bg-rose-100",
    textClass: "text-rose-700",
  },
  suspended: {
    label: "Suspended",
    thaiLabel: "ถูกระงับ",
    bgClass: "bg-rose-100",
    textClass: "text-rose-700",
  },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function CompanyRow({
  company,
  onClick,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}: CompanyRowProps) {
  const { id, companyName, email, status, profilePhoto, createdAt } = company;
  const statusInfo = statusConfig[status];

  const handleRowClick = () => {
    onClick?.();
  };

  const handleActionClick = (
    e: React.MouseEvent,
    action: (companyId: string) => void
  ) => {
    e.stopPropagation();
    action(id);
  };

  return (
    <tr
      data-testid={`company-row-${id}`}
      onClick={handleRowClick}
      className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
    >
      {/* Company Info Cell */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo/Avatar */}
          {profilePhoto ? (
            <Image
              data-testid="company-logo"
              src={profilePhoto}
              alt={companyName}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <div
              data-testid="company-avatar-fallback"
              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
            >
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
          )}

          {/* Name and Email */}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{companyName}</span>
            <span className="text-sm text-gray-500">{email}</span>
          </div>
        </div>
      </td>

      {/* Status Badge Cell */}
      <td className="px-4 py-3">
        <span
          data-testid="status-badge"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}
        >
          {statusInfo.label}
        </span>
      </td>

      {/* Registration Date Cell */}
      <td className="px-4 py-3">
        <span data-testid="company-date" className="text-sm text-gray-600">
          {formatDate(createdAt)}
        </span>
      </td>

      {/* Actions Cell */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {status === "pending" && (
            <>
              <Button
                type="button"
                size="sm"
                onClick={(e) => handleActionClick(e, onApprove!)}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={(e) => handleActionClick(e, onReject!)}
              >
                Reject
              </Button>
            </>
          )}

          {status === "approved" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => handleActionClick(e, onSuspend!)}
              className="text-rose-600 border-rose-600 hover:bg-rose-50"
            >
              Suspend
            </Button>
          )}

          {status === "suspended" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => handleActionClick(e, onReactivate!)}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Reactivate
            </Button>
          )}

          {status === "rejected" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => e.stopPropagation()}
            >
              View
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
