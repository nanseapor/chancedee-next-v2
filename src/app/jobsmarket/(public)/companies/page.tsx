import type { Metadata } from "next";
import { CompaniesClient } from "./_components/CompaniesClient";
import type {
  Industry,
  CompanySize,
  CompanySortOption,
} from "@/types/public-companies";

export const metadata: Metadata = {
  title: "บริษัททั้งหมด | Chancedee Jobs",
  description: "ค้นหาบริษัทชั้นนำที่กำลังเปิดรับสมัครงาน",
};

interface CompaniesPageProps {
  searchParams: Promise<{
    q?: string;
    industry?: string;
    size?: string;
    sort?: string;
    page?: string;
  }>;
}

/**
 * Companies listing page
 * Header/Footer provided by (public)/layout.tsx
 *
 * @specification COMP-R09 Company Directory
 */
export default async function CompaniesListingPage({
  searchParams,
}: CompaniesPageProps) {
  const params = await searchParams;

  // Debug: Log server-parsed params
  console.log("[CompaniesListingPage] Server params:", JSON.stringify(params));

  // Parse comma-separated values for multi-select filters
  const parseCSV = <T extends string>(value: string | undefined): T[] => {
    if (!value) return [];
    return value.split(",").filter(Boolean) as T[];
  };

  // Parse and validate page number (default to 1 if invalid)
  const parsePage = (value: string | undefined): number => {
    if (!value) return 1;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  };

  // Parse URL search params to initial filter state
  const initialFilters = {
    keyword: params.q || "",
    industries: parseCSV<Industry>(params.industry),
    sizes: parseCSV<CompanySize>(params.size),
  };

  const initialSort = (params.sort as CompanySortOption) || "newest";
  const initialPage = parsePage(params.page);

  // Note: No Suspense boundary here as the client component handles its own loading state.
  // This ensures URL params are fully resolved before rendering.
  return (
    <CompaniesClient
      initialFilters={initialFilters}
      initialSort={initialSort}
      initialPage={initialPage}
    />
  );
}
