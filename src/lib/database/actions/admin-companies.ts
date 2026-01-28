"use server";

import { Filter } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import type { CompanyStatus } from "@/types/jobsmarket/company/status";
import type {
  AdminCompanyListItem,
  AdminCompanyCounts,
  GetAdminCompaniesOptions,
  GetAdminCompaniesResult,
  AdminCompanyDetail,
  AdminCompanyStats,
  GetAdminCompanyDetailResult,
} from "./admin-companies.types";

// Re-export types for consumers
export type {
  AdminCompanyListItem,
  AdminCompanyCounts,
  GetAdminCompaniesOptions,
  GetAdminCompaniesResult,
  AdminCompanyDetail,
  AdminCompanyStats,
  GetAdminCompanyDetailResult,
} from "./admin-companies.types";

import { requireAdminAuth } from "./admin-auth";

/**
 * Admin Company Management Actions
 * Per ADM-R02 Company Management RIS §3.1 Company List
 *
 * Server actions for managing companies in the admin panel.
 */

/**
 * Get paginated list of companies for admin management
 *
 * @param options - Filter and pagination options
 * @returns Companies list with counts and pagination info
 */
export async function getAdminCompanies(
  options: GetAdminCompaniesOptions = {}
): Promise<GetAdminCompaniesResult> {
  try {
    // Verify admin authorization
    await requireAdminAuth();

    const db = getFirebaseAdminFirestore();
    const { status, search, limit = 20, startAfter } = options;

    // If searching by company ID (starts with "comp-"), do direct lookup only
    // This avoids the composite index requirement for status + orderBy queries
    if (search && search.trim().startsWith("comp-")) {
      const directLookup = await db
        .collection("company_information")
        .doc(search.trim())
        .get();

      const counts = await getCompanyCountsByStatus();

      if (directLookup.exists) {
        const data = directLookup.data()!;
        // Check if status filter matches (if provided)
        if (!status || data.status === status) {
          const company: AdminCompanyListItem = {
            id: directLookup.id,
            companyName: data.company_name || "",
            email: data.email || "",
            status: data.status || "pending",
            profilePhoto: data.profile_photo || null,
            industry: data.industry,
            createdAt: data.created_at?.toDate() || new Date(),
          };

          return {
            success: true,
            data: {
              companies: [company],
              counts,
              hasMore: false,
              lastDocId: directLookup.id,
            },
          };
        }
      }

      // Company ID search but document not found or status doesn't match - return empty
      return {
        success: true,
        data: {
          companies: [],
          counts,
          hasMore: false,
          lastDocId: null,
        },
      };
    }

    // Fetch all companies without composite index requirement
    // Using simple collection scan to avoid needing (status + created_at) composite index
    const snapshot = await db.collection("company_information").get();
    const docs = snapshot.docs;

    // Transform to AdminCompanyListItem
    let companies: AdminCompanyListItem[] = docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        companyName: data.company_name || "",
        email: data.email || "",
        status: data.status || "pending",
        profilePhoto: data.profile_photo || null,
        industry: data.industry,
        createdAt: data.created_at?.toDate() || new Date(),
      };
    });

    // Apply status filter (client-side to avoid composite index requirement)
    if (status) {
      companies = companies.filter((company) => company.status === status);
    }

    // Apply search filter (client-side for simplicity)
    // In production, this would use a search service like Algolia or Meilisearch
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      companies = companies.filter(
        (company) =>
          company.id.toLowerCase().includes(searchLower) ||
          company.companyName.toLowerCase().includes(searchLower) ||
          company.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at descending (client-side)
    companies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination (client-side)
    if (startAfter) {
      const startIndex = companies.findIndex((c) => c.id === startAfter);
      if (startIndex !== -1) {
        companies = companies.slice(startIndex + 1);
      }
    }

    // Apply limit
    const hasMore = companies.length > limit;
    companies = companies.slice(0, limit);

    // Get counts for each status
    const counts = await getCompanyCountsByStatus();

    // Get last document ID for pagination
    const lastCompany = companies[companies.length - 1];
    const lastDocId = lastCompany?.id ?? null;

    return {
      success: true,
      data: {
        companies,
        counts,
        hasMore,
        lastDocId,
      },
    };
  } catch (error) {
    console.error("[Admin Companies] Error fetching companies:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden")
      ) {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    return {
      success: false,
      error: "Failed to fetch companies",
    };
  }
}

/**
 * Get count of companies grouped by status
 */
async function getCompanyCountsByStatus(): Promise<AdminCompanyCounts> {
  const db = getFirebaseAdminFirestore();
  const collection = db.collection("company_information");

  // Get all companies and count by status
  // Note: In production, these counts could be cached or precomputed
  const snapshot = await collection.get();

  const counts: AdminCompanyCounts = {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  };

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    counts.all++;

    const status = data.status as CompanyStatus;
    if (status in counts) {
      counts[status]++;
    }
  });

  return counts;
}

/**
 * Get company counts by status for admin dashboard
 * Exported for use in admin stats hook
 */
export async function getAdminCompanyCounts(): Promise<AdminCompanyCounts> {
  await requireAdminAuth();
  return getCompanyCountsByStatus();
}

/**
 * Get company detail for admin management
 *
 * @param companyId - The company ID to fetch
 * @returns Company details with stats or error
 */
export async function getAdminCompanyDetail(
  companyId: string
): Promise<GetAdminCompanyDetailResult> {
  try {
    // Verify admin authorization
    await requireAdminAuth();

    const db = getFirebaseAdminFirestore();

    // Fetch the company document
    const companyDoc = await db
      .collection("company_information")
      .doc(companyId)
      .get();

    if (!companyDoc.exists) {
      return {
        success: false,
        error: "Company not found",
        notFound: true,
      };
    }

    const data = companyDoc.data()!;

    // Transform to AdminCompanyDetail
    const company: AdminCompanyDetail = {
      id: companyDoc.id,
      companyName: data.company_name || "",
      companyNameEn: data.company_name_en || null,
      email: data.email || "",
      phone: data.phone || null,
      status: data.status || "pending",
      profilePhoto: data.profile_photo || null,
      industry: data.industry || null,
      companySize: data.company_size || null,
      shortDescription: data.short_description || null,
      overview: data.overview || null,
      address: data.address || null,
      province: data.province || null,
      district: data.district || null,
      subDistrict: data.sub_district || null,
      postCode: data.post_code || null,
      website: data.website || null,
      taxId: data.tax_id || null,
      createdAt: data.created_at?.toDate() || new Date(),
      updatedAt: data.updated_at?.toDate() || new Date(),
    };

    // Fetch stats for the company
    const stats = await getCompanyStats(companyId);

    return {
      success: true,
      data: {
        company,
        stats,
      },
    };
  } catch (error) {
    console.error("[Admin Company Detail] Error fetching company:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden")
      ) {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    return {
      success: false,
      error: "Failed to fetch company details",
    };
  }
}

/**
 * Get stats for a company (job count, team size, application count)
 */
async function getCompanyStats(companyId: string): Promise<AdminCompanyStats> {
  const db = getFirebaseAdminFirestore();

  // Count jobs for this company
  const jobsSnapshot = await db
    .collection("jobs")
    .where("company_id", "==", companyId)
    .get();
  const jobCount = jobsSnapshot.size;

  // Count team members (company users)
  const teamSnapshot = await db
    .collection("company_users")
    .where("company_id", "==", companyId)
    .get();
  const teamSize = teamSnapshot.size;

  // Count applications for this company's jobs
  let applicationCount = 0;
  if (jobCount > 0) {
    const jobIds = jobsSnapshot.docs.map((doc) => doc.id);
    // Firestore 'in' query supports max 30 values, so we chunk if needed
    const chunks = [];
    for (let i = 0; i < jobIds.length; i += 30) {
      chunks.push(jobIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      const appsSnapshot = await db
        .collection("applications")
        .where("job_id", "in", chunk)
        .get();
      applicationCount += appsSnapshot.size;
    }
  }

  return {
    jobCount,
    teamSize,
    applicationCount,
  };
}
