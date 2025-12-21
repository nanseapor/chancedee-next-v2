"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JobListHeader } from "@/components/jobsmarket/company/jobs/JobListHeader";
import { StatusTabs } from "@/components/jobsmarket/company/jobs/StatusTabs";
import { BulkActionsBar } from "@/components/jobsmarket/company/jobs/BulkActionsBar";
import { JobTable } from "@/components/jobsmarket/company/jobs/JobTable";
import { CloseJobModal } from "@/components/jobsmarket/company/jobs/CloseJobModal";
import { DeleteJobModal } from "@/components/jobsmarket/company/jobs/DeleteJobModal";
import { BulkActionModal } from "@/components/jobsmarket/company/jobs/BulkActionModal";
import { useCompanyJobs } from "@/hooks/jobsmarket/company/use-company-jobs";
import { useJobActions } from "@/hooks/jobsmarket/company/use-job-actions";
import { useBulkJobActions } from "@/hooks/jobsmarket/company/use-bulk-job-actions";
import type { JobAction } from "@/types/jobsmarket/jobs-list.types";
import type { JobStatus } from "@/types/job.types";

interface JobListPageProps {
  companyId: string;
  canCreateJobs?: boolean;
}

type TabStatus = "all" | "active" | "draft" | "paused" | "closed";

const TAB_TO_STATUS_MAP: Record<TabStatus, JobStatus | "all" | undefined> = {
  all: undefined,
  active: "published",
  draft: "draft",
  paused: "unpublished",
  closed: "closed",
};

// Valid status values from URL
const VALID_STATUSES: Array<JobStatus | "all"> = [
  "published",
  "draft",
  "unpublished",
  "closed",
  "ontimer",
  "all",
];

export function JobListPage({ companyId, canCreateJobs = true }: JobListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters with validation
  const rawStatusParam = searchParams.get("status");
  const statusParam = rawStatusParam && VALID_STATUSES.includes(rawStatusParam as JobStatus | "all")
    ? (rawStatusParam as JobStatus | "all")
    : undefined;
  const searchQuery = searchParams.get("q") || undefined;
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // Determine active tab based on status parameter
  const getActiveTab = (): TabStatus => {
    if (!statusParam) return "all";
    if (statusParam === "published") return "active";
    if (statusParam === "draft") return "draft";
    if (statusParam === "unpublished") return "paused";
    if (statusParam === "closed") return "closed";
    return "all";
  };

  const [activeTab, setActiveTab] = useState<TabStatus>(getActiveTab());
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"close" | "delete" | null>(null);
  const [selectedJobForAction, setSelectedJobForAction] = useState<string | null>(null);

  // Bulk modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"pause" | "close" | null>(null);

  // Fetch jobs data
  const {
    jobs,
    aggregation,
    total,
    page,
    limit,
    isLoading,
    error,
    mutate,
  } = useCompanyJobs(companyId, {
    status: statusParam,
    q: searchQuery,
    page: currentPage,
    limit: 10,
  });

  // Job actions
  const {
    handlePublish,
    handleUnpublish,
    handleClose: closeJob,
    handleDelete: deleteJob,
    handleDuplicate,
  } = useJobActions(mutate);

  // Bulk actions
  const {
    handleBulkPause: bulkPause,
    handleBulkClose: bulkClose,
  } = useBulkJobActions(() => {
    setSelectedJobs(new Set());
    mutate();
  });

  const handleBulkPauseClick = () => {
    setBulkActionType("pause");
    setIsBulkModalOpen(true);
  };

  const handleBulkCloseClick = () => {
    setBulkActionType("close");
    setIsBulkModalOpen(true);
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setBulkActionType(null);
  };

  // Update URL when parameters change
  const updateURL = useCallback(
    (params: { status?: string; q?: string; page?: number }) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (params.status) {
        newParams.set("status", params.status);
      } else if (params.status === undefined && params.status !== null) {
        newParams.delete("status");
      }

      if (params.q) {
        newParams.set("q", params.q);
      } else if (params.q === "") {
        newParams.delete("q");
      }

      if (params.page && params.page > 1) {
        newParams.set("page", params.page.toString());
      } else {
        newParams.delete("page");
      }

      const newURL = `${window.location.pathname}?${newParams.toString()}`;
      router.push(newURL);
    },
    [router, searchParams]
  );

  // Tab change handler
  const handleTabChange = (tab: TabStatus) => {
    setActiveTab(tab);
    const status = TAB_TO_STATUS_MAP[tab];
    updateURL({ status: status || "", page: 1 });
  };

  // Search handler
  const handleSearch = (query: string) => {
    updateURL({ q: query, page: 1 });
  };

  // Page change handler
  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage });
  };

  // Job selection handlers
  const handleSelectJob = (jobId: string, selected: boolean) => {
    const newSelection = new Set(selectedJobs);
    if (selected) {
      newSelection.add(jobId);
    } else {
      newSelection.delete(jobId);
    }
    setSelectedJobs(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedJobs(new Set(jobs.map((job) => job.uid)));
    } else {
      setSelectedJobs(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedJobs(new Set());
  };

  // Job action handler
  const handleJobAction = (jobId: string, action: JobAction) => {
    switch (action) {
      case "view":
        router.push(`/jobsmarket/jobs/${jobId}`);
        break;
      case "edit":
        router.push(`/jobsmarket/jobs/${jobId}/edit`);
        break;
      case "publish":
        handlePublish(jobId);
        break;
      case "unpublish":
        handleUnpublish(jobId);
        break;
      case "close":
        setSelectedJobForAction(jobId);
        setModalType("close");
        setIsModalOpen(true);
        break;
      case "duplicate":
        handleDuplicate(jobId);
        break;
      case "delete":
        setSelectedJobForAction(jobId);
        setModalType("delete");
        setIsModalOpen(true);
        break;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedJobForAction(null);
  };

  // Calculate bulk action button states
  const selectedJobsData = jobs.filter((job) => selectedJobs.has(job.uid));
  const hasPublishedJobs = selectedJobsData.some((job) => job.jobStatus === "published");
  const hasNonClosedJobs = selectedJobsData.some((job) => job.jobStatus !== "closed");

  // Status counts - map JobListAggregation to StatusCounts
  const statusCounts = aggregation
    ? {
        total: aggregation.all,
        active: aggregation.published,
        draft: aggregation.draft,
        paused: aggregation.unpublished,
        closed: aggregation.closed,
      }
    : {
        total: 0,
        active: 0,
        draft: 0,
        paused: 0,
        closed: 0,
      };

  return (
    <div className="space-y-6">
      <JobListHeader
        companyId={companyId}
        onSearch={handleSearch}
        canCreateJobs={canCreateJobs}
      />

      <StatusTabs
        activeStatus={activeTab}
        counts={statusCounts}
        onTabChange={handleTabChange}
        isLoading={isLoading}
      />

      <BulkActionsBar
        selectedCount={selectedJobs.size}
        hasPublishedJobs={hasPublishedJobs}
        hasNonClosedJobs={hasNonClosedJobs}
        onBulkPause={handleBulkPauseClick}
        onBulkClose={handleBulkCloseClick}
        onClearSelection={handleClearSelection}
      />

      <JobTable
        jobs={jobs}
        selectedJobs={selectedJobs}
        onSelectJob={handleSelectJob}
        onSelectAll={handleSelectAll}
        onJobAction={handleJobAction}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        companyId={companyId}
      />

      {/* Action Modals */}
      {modalType === "close" && selectedJobForAction && (() => {
        const job = jobs.find((j) => j.uid === selectedJobForAction);
        if (!job) return null;
        return (
          <CloseJobModal
            isOpen={isModalOpen}
            jobTitle={job.title}
            onConfirm={async () => {
              await closeJob(selectedJobForAction);
              closeModal();
            }}
            onCancel={closeModal}
          />
        );
      })()}

      {modalType === "delete" && selectedJobForAction && (() => {
        const job = jobs.find((j) => j.uid === selectedJobForAction);
        if (!job) return null;
        return (
          <DeleteJobModal
            isOpen={isModalOpen}
            jobTitle={job.title}
            hasApplications={job.applicationCount > 0}
            onConfirm={async () => {
              await deleteJob(selectedJobForAction);
              closeModal();
            }}
            onCancel={closeModal}
          />
        );
      })()}

      {/* Bulk Action Modals */}
      {bulkActionType && (
        <BulkActionModal
          isOpen={isBulkModalOpen}
          actionType={bulkActionType}
          selectedCount={selectedJobs.size}
          onConfirm={async () => {
            if (bulkActionType === "pause") {
              await bulkPause(selectedJobs);
            } else if (bulkActionType === "close") {
              await bulkClose(selectedJobs);
            }
            closeBulkModal();
          }}
          onCancel={closeBulkModal}
        />
      )}
    </div>
  );
}
