"use client";

import { Building2 } from "lucide-react";

import type { AdminCompanyListItem } from "@/lib/database/actions/admin-companies";
import { CompanyRow } from "./CompanyRow";

/**
 * CompanyTable component for admin company list
 * Per ADM-R02 Company Management RIS §3.1.2 Company Table
 *
 * Displays companies in a data table with:
 * - Column headers
 * - Company rows with CompanyRow component
 * - Loading and empty states
 */

export interface CompanyTableProps {
  companies: AdminCompanyListItem[];
  isLoading?: boolean;
  onRowClick?: (companyId: string) => void;
  onApprove?: (companyId: string) => void;
  onReject?: (companyId: string) => void;
  onSuspend?: (companyId: string) => void;
  onReactivate?: (companyId: string) => void;
}

function SkeletonRow() {
  return (
    <tr data-testid="skeleton-row" className="animate-pulse">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200" />
          <div className="flex flex-col gap-1">
            <div className="w-32 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="w-20 h-5 bg-gray-200 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="w-20 h-8 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-12 text-gray-500"
    >
      <Building2 className="w-12 h-12 mb-4 text-gray-400" />
      <p className="text-lg font-medium">No companies found</p>
      <p className="text-sm text-gray-400 mt-1">
        Try adjusting your filters or search
      </p>
    </div>
  );
}

export function CompanyTable({
  companies,
  isLoading = false,
  onRowClick,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}: CompanyTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <div data-testid="table-skeleton" className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Registered
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (companies.length === 0) {
    return <EmptyState />;
  }

  // Normal table
  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Company
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Registered
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {companies.map((company) => (
            <CompanyRow
              key={company.id}
              company={company}
              onClick={() => onRowClick?.(company.id)}
              onApprove={onApprove}
              onReject={onReject}
              onSuspend={onSuspend}
              onReactivate={onReactivate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
