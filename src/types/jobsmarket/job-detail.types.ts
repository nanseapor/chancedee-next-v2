/**
 * COMP-R07: Job Detail/Edit Page Types
 * Types for job detail view, edit mode, analytics, and status actions
 */

import type { FirebaseJobData } from "@/types/job.types";

/**
 * Page modes
 */
export type PageMode = "view" | "edit";

/**
 * View mode tabs
 */
export type ViewTab = "overview" | "applications" | "settings";

/**
 * Page state machine states
 */
export type PageState =
  | "loading"
  | "auth_check"
  | "access_check"
  | "view_mode"
  | "edit_mode"
  | "saving"
  | "confirming"
  | "processing"
  | "not_found"
  | "error";

/**
 * Edit mode states
 */
export type EditState = "clean" | "dirty" | "saving" | "confirming";

/**
 * Job with aggregated analytics data
 * Extends base job with computed fields
 */
export interface JobWithAnalytics extends FirebaseJobData {
  // Aggregated counts
  applicationCount: number;
  unreadApplicationCount: number;
  viewCount: number;
}

/**
 * Job analytics data from job_analytics collection
 * Updated hourly by background job
 */
export interface JobAnalytics {
  jobId: string;
  totalViews: number;
  viewsChange: number; // % change vs previous 30 days
  dailyViews: DailyView[]; // Last 30 days
  applicationCount: number; // Total applications
  unreadApplicationCount: number; // Unread applications
  conversionRate: number; // (applications / views) * 100
  conversionChange: number; // % vs previous period
  lastUpdated: number; // Timestamp
}

/**
 * Daily view data point for analytics chart
 */
export interface DailyView {
  date: string; // YYYY-MM-DD format
  views: number;
}

/**
 * Application preview for recent applications list
 */
export interface ApplicationPreview {
  uid: string;
  candidateId: string;
  candidateName: string;
  candidatePhoto?: string;
  status: string;
  appliedAt: number;
  isRead: boolean;
}

/**
 * Job application data for applications list
 */
export interface JobApplication {
  applicationId: string;
  candidateName: string;
  candidateAvatar?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'withdrawn';
  appliedAt: number; // Timestamp
  isUnread: boolean;
}

/**
 * Action modal state union type
 */
export type ActionModalState =
  | null
  | { type: "close"; title: string }
  | { type: "delete"; title: string; hasApps: boolean }
  | { type: "discard_changes" }
  | { type: "unpublish"; title: string };

/**
 * Job status type (from FirebaseJobData)
 */
export type JobStatus = "draft" | "ontimer" | "published" | "unpublished" | "closed";

/**
 * Status action availability matrix
 * Defines which actions are available for each job status
 */
export const STATUS_ACTIONS: Record<JobStatus, string[]> = {
  draft: ["publish", "close", "delete", "duplicate"],
  ontimer: ["activate_now", "cancel_schedule", "close", "duplicate"],
  published: ["unpublish", "close", "duplicate"],
  unpublished: ["publish", "close", "duplicate"],
  closed: ["duplicate"],
};

/**
 * Server action result type
 */
export interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Duplicate job result with new job ID
 */
export interface DuplicateResult extends ActionResult {
  jobId?: string;
}

/**
 * Helper: Check if action is available for job status
 * @param status Current job status
 * @param action Action to check
 * @returns True if action is available
 */
export function isActionAvailable(status: JobStatus, action: string): boolean {
  return STATUS_ACTIONS[status]?.includes(action) ?? false;
}

/**
 * Helper: Check if job can be edited
 * @param status Current job status
 * @returns True if job can be edited
 */
export function canEditJob(status: JobStatus): boolean {
  return status !== "closed";
}

/**
 * Helper: Check if job can be deleted
 * @param status Current job status
 * @param applicationCount Number of applications
 * @returns True if job can be deleted
 */
export function canDeleteJob(status: JobStatus, applicationCount: number): boolean {
  return status === "draft" && applicationCount === 0;
}
