import { JobStatus } from "@/types/job.types";

/**
 * Simplified job data for list view
 * Used in company dashboard jobs list
 */
export interface JobListItem {
  uid: string;
  title: string;
  jobStatus: JobStatus;
  isActive: boolean;
  applicationCount: number;
  unreadApplicationCount: number;
  viewCount: number;
  createdAt: number;
  updatedAt: number;
  department?: string;
  jobFunctionText?: string;
  postStartDate?: number;
  postExpiryDate?: number;
}

/**
 * Query parameters for jobs list
 */
export interface JobListQuery {
  status?: JobStatus | "all";
  q?: string; // search query
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "applicationCount" | "viewCount";
}

/**
 * Aggregation counts for status tabs
 */
export interface JobListAggregation {
  all: number;
  published: number;
  draft: number;
  unpublished: number;
  closed: number;
}

/**
 * Status counts for UI display (tab labels)
 * Maps to user-friendly names
 */
export interface StatusCounts {
  total: number;      // maps to "all"
  active: number;     // maps to "published"
  draft: number;      // maps to "draft"
  paused: number;     // maps to "unpublished"
  closed: number;     // maps to "closed"
}

/**
 * Response from jobs list API
 */
export interface JobListResponse {
  success: boolean;
  data?: JobListItem[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

/**
 * Response from aggregation API
 */
export interface JobAggregationResponse {
  success: boolean;
  data?: JobListAggregation;
  error?: string;
}

/**
 * Bulk operation result
 */
export interface BulkActionResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

/**
 * Job action types
 */
export type JobAction =
  | "view"
  | "edit"
  | "publish"
  | "unpublish"
  | "close"
  | "duplicate"
  | "delete";

export type { JobStatus };
