"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminCompanies } from "@/hooks/jobsmarket/admin/use-admin-companies";
import type { CompanyStatus } from "@/types/jobsmarket/company/status";
import { CompanyFilters } from "./CompanyFilters";
import { CompanyTable } from "./CompanyTable";

/**
 * CompaniesClient component for admin company list page
 * Per ADM-R02 Company Management RIS §3.1 Company List Page
 *
 * Main client component that integrates:
 * - CompanyFilters
 * - CompanyTable
 * - Pagination
 * - URL state management
 */

export function CompaniesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get URL params
  const urlStatus = searchParams.get("status") as CompanyStatus | null;
  const urlSearch = searchParams.get("search") || "";

  // Use URL params directly as the source of truth
  const status = urlStatus || undefined;
  const search = urlSearch;

  // Fetch companies using the hook
  const {
    companies,
    counts,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useAdminCompanies({
    status,
    search,
  });

  // Update URL when filters change
  const updateUrl = useCallback(
    (newStatus: CompanyStatus | undefined, newSearch: string) => {
      const params = new URLSearchParams();
      if (newStatus) {
        params.set("status", newStatus);
      }
      if (newSearch) {
        params.set("search", newSearch);
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname]
  );

  // Handle status change - only update URL, state is derived from URL
  const handleStatusChange = useCallback(
    (newStatus: CompanyStatus | undefined) => {
      updateUrl(newStatus, search);
    },
    [search, updateUrl]
  );

  // Handle search change - only update URL, state is derived from URL
  const handleSearchChange = useCallback(
    (newSearch: string) => {
      updateUrl(status, newSearch);
    },
    [status, updateUrl]
  );

  // Handle row click - navigate to company detail
  const handleRowClick = useCallback(
    (companyId: string) => {
      router.push(`/platform/companies/${companyId}`);
    },
    [router]
  );

  // Handle action buttons (placeholder - to be implemented in company detail actions)
  const handleApprove = useCallback((companyId: string) => {
    console.log("Approve company:", companyId);
    // TODO: Implement approve action
  }, []);

  const handleReject = useCallback((companyId: string) => {
    console.log("Reject company:", companyId);
    // TODO: Implement reject action
  }, []);

  const handleSuspend = useCallback((companyId: string) => {
    console.log("Suspend company:", companyId);
    // TODO: Implement suspend action
  }, []);

  const handleReactivate = useCallback((companyId: string) => {
    console.log("Reactivate company:", companyId);
    // TODO: Implement reactivate action
  }, []);

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <CompanyFilters
          activeStatus={status}
          searchQuery={search}
          counts={counts}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onSearchChange={handleSearchChange}
        />
        <div
          data-testid="error-state"
          className="flex flex-col items-center justify-center py-12 text-gray-500"
        >
          <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Error loading companies
          </p>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <Button
            type="button"
            onClick={refresh}
            variant="secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <CompanyFilters
        activeStatus={status}
        searchQuery={search}
        counts={counts}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onSearchChange={handleSearchChange}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CompanyTable
          companies={companies}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onReactivate={handleReactivate}
        />
      </div>

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={loadMore}
            variant="outline"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage company registrations and approvals
      </p>
    </div>
  );
}
