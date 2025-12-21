import type { JobStatus, JobListItem } from "@/types/jobsmarket/jobs-list.types";

/**
 * Get Tailwind color classes for job status badge
 */
export function getJobStatusColor(status: JobStatus): string {
  const colorMap: Record<JobStatus, string> = {
    published: "bg-green-100 text-green-700 border-green-700",
    draft: "bg-gray-100 text-gray-700 border-gray-700",
    unpublished: "bg-amber-100 text-amber-700 border-amber-700",
    closed: "bg-rose-100 text-rose-700 border-rose-700",
    ontimer: "bg-blue-100 text-blue-700 border-blue-700",
  };
  return colorMap[status];
}

/**
 * Get Thai label for job status
 */
export function getJobStatusLabel(status: JobStatus): string {
  const labelMap: Record<JobStatus, string> = {
    published: "เผยแพร่แล้ว",
    draft: "ร่าง",
    unpublished: "หยุดชั่วคราว",
    closed: "ปิดแล้ว",
    ontimer: "รอเผยแพร่",
  };
  return labelMap[status];
}

/**
 * Check if job can be edited
 * Jobs can be edited unless they are closed
 */
export function canEditJob(job: JobListItem): boolean {
  return job.jobStatus !== "closed";
}

/**
 * Check if job can be deleted
 * Only draft jobs with no applications can be deleted
 */
export function canDeleteJob(job: JobListItem): boolean {
  return job.jobStatus === "draft" && job.applicationCount === 0;
}

/**
 * Format timestamp to Thai date format (DD/MM/YYYY)
 */
export function formatJobDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format posted date range for job list
 * Returns Thai format like "01/01/2024 - 30/01/2024"
 */
export function formatPostedDateRange(
  startDate?: number,
  expiryDate?: number
): string {
  if (!startDate) return "-";

  const start = formatJobDate(startDate);

  if (!expiryDate) return start;

  const expiry = formatJobDate(expiryDate);
  return `${start} - ${expiry}`;
}
