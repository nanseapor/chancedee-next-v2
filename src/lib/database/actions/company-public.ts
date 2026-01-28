"use server";

import { Filter, FieldPath } from "firebase-admin/firestore";
import { jobsRepository } from "../repositories/jobs-repository";
import type { JobCardData } from "@/types/public-jobs";

/**
 * Get public company profile
 * Only returns approved, active companies
 *
 * @param companyId - The company UID
 * @returns Company data or null if not found/not visible
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 */
export async function getPublicCompanyProfile(companyId: string) {
  const { webCompanyInformationGetById } = await import("./company-information");

  const company = await webCompanyInformationGetById(companyId);

  // Only return publicly visible companies
  if (!company) return null;
  if (company.status !== "approved") return null;
  if (!company.isActive) return null;

  return company;
}

/**
 * Get active jobs for a company (public view)
 * Returns only published, active jobs
 *
 * @param companyId - The company UID
 * @param limit - Maximum number of jobs to return (default 6)
 * @returns Array of job cards
 *
 * @specification BLS-02 §3.7 viewCompanyJobs
 */
export async function getCompanyActiveJobs(
  companyId: string,
  limit: number = 6
): Promise<JobCardData[]> {
  try {
    // Build filter for active, published jobs
    const filter = Filter.and(
      Filter.where("companyId", "==", companyId),
      Filter.where("isActive", "==", true),
      Filter.or(
        Filter.where("jobStatus", "==", "published"),
        Filter.where("jobStatus", "==", "ontimer")
      )
    );

    const jobs = await jobsRepository.getByFilter(filter);

    if (!jobs || jobs.length === 0) {
      return [];
    }

    // Sort by createdAt desc and limit, filter out jobs without uid
    const sortedJobs = jobs
      .filter((job) => job.uid)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit);

    // Map to JobCardData format
    return sortedJobs.map((job) => ({
      uid: job.uid as string,
      title: job.title || "",
      companyId: job.companyId || companyId,
      companyName: job.companyName || "",
      companyLogo: job.companyLogo || "",
      minSalary: job.minSalary ?? null,
      maxSalary: job.maxSalary ?? null,
      isNegotiable: job.isNegotiable ?? false,
      workLocationText: job.workLocation || "",
      employmentText: job.employment || "",
      experienceText: job.experienceText || job.experience || "",
      createdAt: job.createdAt || Date.now(),
    }));
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return [];
  }
}
