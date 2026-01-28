import { Suspense } from "react";

import { CompaniesClient } from "./_components/CompaniesClient";

/**
 * Admin Companies List Page
 * Per ADM-R02 Company Management RIS §3.1 Company List
 *
 * Displays paginated list of companies with:
 * - Status filtering (All, Pending, Approved, Rejected, Suspended)
 * - Search functionality
 * - Context-sensitive action buttons
 */

export const metadata = {
  title: "Companies | Admin",
  description: "Manage company registrations and approvals",
};

export default function CompaniesPage() {
  return (
    <Suspense fallback={<CompaniesPageSkeleton />}>
      <CompaniesClient />
    </Suspense>
  );
}

function CompaniesPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-200 rounded mt-2" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-10 w-64 bg-gray-200 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded mt-2" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
