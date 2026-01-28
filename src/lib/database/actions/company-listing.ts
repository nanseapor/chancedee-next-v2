"use server";

/**
 * Company Listing Server Actions
 *
 * Server actions for public company directory (COMP-R09)
 * No authentication required - public access
 */

import { Filter } from "firebase-admin/firestore";
import { companyInformationRepository } from "@/lib/database/repositories/company-information-repository";
import { jobsRepository } from "@/lib/database/repositories/jobs-repository";
import type {
  CompanySearchParams,
  CompanySearchResponse,
  CompanyCardData,
  CompanySize,
} from "@/types/public-companies";
import {
  getIndustryLabel,
  getCompanySizeLabel,
  COMPANIES_PER_PAGE,
} from "@/lib/constants/jobsmarket/company-filters";

/**
 * Search public companies with filters
 *
 * @param params - Search parameters (filters, sort, pagination)
 * @returns CompanySearchResponse with companies array and metadata
 *
 * @specification BLS-02 §1.2 Company directory
 */
export async function getPublicCompaniesList(
  params: CompanySearchParams = {}
): Promise<CompanySearchResponse> {
  const startTime = Date.now();
  const page = params.page || 1;
  const pageSize = params.pageSize || COMPANIES_PER_PAGE;

  try {
    // Build filter for approved, active companies
    const filter = Filter.and(
      Filter.where("status", "==", "approved"),
      Filter.where("is_active", "==", true)
    );

    // Get all approved companies (repository handles transformation)
    // TODO: Optimize with pagination for large datasets
    const allCompanies = await companyInformationRepository.getByFilter(filter);

    if (!allCompanies || allCompanies.length === 0) {
      return {
        success: true,
        data: {
          companies: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // Apply keyword filter (in-memory)
    let filteredCompanies = allCompanies;
    if (params.q && params.q.trim() !== "") {
      const searchTerm = params.q.toLowerCase().trim();
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.companyName?.toLowerCase().includes(searchTerm) ||
          company.shortDescriptionText?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply industry filter
    if (params.industries && params.industries.length > 0) {
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.industry &&
          params.industries!.includes(company.industry as never)
      );
    }

    // Apply size filter
    if (params.sizes && params.sizes.length > 0) {
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.companySize &&
          params.sizes!.includes(company.companySize as CompanySize)
      );
    }

    // Get open job counts for each company (batch)
    const companyIds = filteredCompanies.map((c) => c.uid);
    const jobCounts = await getOpenJobCountsForCompanies(companyIds);

    // Transform to CompanyCardData with job counts
    const companiesWithCounts: CompanyCardData[] = filteredCompanies.map(
      (company) => ({
        uid: company.uid,
        companyName: company.companyName,
        profilePhoto: company.profilePhoto || null,
        industry: company.industry || null,
        industryLabel: getIndustryLabel(company.industry),
        companySize: (company.companySize as CompanySize) || null,
        companySizeLabel: getCompanySizeLabel(
          company.companySize as CompanySize
        ),
        shortDescriptionText: company.shortDescriptionText || null,
        openJobsCount: jobCounts.get(company.uid) || 0,
        createdAt: company.createdAt || 0,
      })
    );

    // Sort
    const sortedCompanies = sortCompanies(
      companiesWithCounts,
      params.sort || "newest"
    );

    // Pagination
    const totalCount = sortedCompanies.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedCompanies = sortedCompanies.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    return {
      success: true,
      data: {
        companies: paginatedCompanies,
        totalCount,
        totalPages,
        currentPage: page,
        processingTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error("Error searching companies:", error);
    return {
      success: false,
      error: "ไม่สามารถค้นหาบริษัทได้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

/**
 * Get open job counts for multiple companies
 * Returns a Map of companyId -> jobCount
 */
async function getOpenJobCountsForCompanies(
  companyIds: string[]
): Promise<Map<string, number>> {
  const jobCounts = new Map<string, number>();

  if (companyIds.length === 0) return jobCounts;

  try {
    // Get all active published jobs
    const filter = Filter.and(
      Filter.where("is_active", "==", true),
      Filter.or(
        Filter.where("job_status", "==", "published"),
        Filter.where("job_status", "==", "ontimer")
      )
    );

    const allJobs = await jobsRepository.getByFilter(filter);

    // Count jobs per company
    for (const job of allJobs) {
      if (job.companyId && companyIds.includes(job.companyId)) {
        const currentCount = jobCounts.get(job.companyId) || 0;
        jobCounts.set(job.companyId, currentCount + 1);
      }
    }
  } catch (error) {
    console.error("Error fetching job counts:", error);
    // Return empty counts on error - non-critical
  }

  return jobCounts;
}

/**
 * Sort companies by specified option
 */
function sortCompanies(
  companies: CompanyCardData[],
  sort: string
): CompanyCardData[] {
  return [...companies].sort((a, b) => {
    switch (sort) {
      case "alphabetical":
        return (a.companyName || "").localeCompare(b.companyName || "", "th");
      case "most_jobs":
        return b.openJobsCount - a.openJobsCount;
      case "newest":
      default:
        return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });
}
