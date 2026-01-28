import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type {
  CompanyFilterState,
  Industry,
  CompanySize,
  CompanySortOption,
} from "@/types/public-companies";

export interface UseCompanyFiltersProps {
  initialFilters: {
    keyword: string;
    industries: Industry[];
    sizes: CompanySize[];
  };
  initialSort: CompanySortOption;
  initialPage: number;
}

export interface UseCompanyFiltersReturn {
  // Current filter state
  filters: CompanyFilterState;

  // Filter update functions
  setKeyword: (keyword: string) => void;
  setIndustries: (industries: Industry[]) => void;
  setSizes: (sizes: CompanySize[]) => void;
  setSort: (sort: CompanySortOption) => void;
  setPage: (page: number) => void;

  // Batch operations
  updateFilters: (newFilters: CompanyFilterState) => void;
  clearAllFilters: () => void;

  // Utility
  hasActiveFilters: boolean;
}

/**
 * Hook for managing company search filter state and URL synchronization
 *
 * Uses window.location.search directly to avoid stale closure issues
 * (learned from COMP-R08 implementation)
 *
 * @param props - Initial filter state from URL params
 * @returns Filter state and update functions
 */
export function useCompanyFilters({
  initialFilters,
  initialSort,
  initialPage,
}: UseCompanyFiltersProps): UseCompanyFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();

  // Convert keyword to q for CompanyFilterState
  const initialState: CompanyFilterState = {
    q: initialFilters.keyword,
    industries: initialFilters.industries,
    sizes: initialFilters.sizes,
    sort: initialSort,
    page: initialPage,
  };

  // Local state
  const [filters, setFilters] = useState<CompanyFilterState>(initialState);

  // Sync local state with props when URL changes (e.g., navigation, refresh)
  // Serialize arrays to strings for stable dependency comparison
  const industriesKey = initialFilters.industries.join(",");
  const sizesKey = initialFilters.sizes.join(",");

  useEffect(() => {
    setFilters({
      q: initialFilters.keyword,
      industries: initialFilters.industries,
      sizes: initialFilters.sizes,
      sort: initialSort,
      page: initialPage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters.keyword, industriesKey, sizesKey, initialSort, initialPage]);

  // Sync URL with filter state
  const updateURL = useCallback(
    (newFilters: CompanyFilterState) => {
      // Use window.location.search directly to avoid stale closure
      const params = new URLSearchParams(window.location.search);

      // Keyword
      if (newFilters.q) {
        params.set("q", newFilters.q);
      } else {
        params.delete("q");
      }

      // Industries (comma-separated)
      if (newFilters.industries.length > 0) {
        params.set("industry", newFilters.industries.join(","));
      } else {
        params.delete("industry");
      }

      // Sizes (comma-separated)
      if (newFilters.sizes.length > 0) {
        params.set("size", newFilters.sizes.join(","));
      } else {
        params.delete("size");
      }

      // Sort (only include if not default)
      if (newFilters.sort !== "newest") {
        params.set("sort", newFilters.sort);
      } else {
        params.delete("sort");
      }

      // Page (only include if not first page)
      if (newFilters.page > 1) {
        params.set("page", newFilters.page.toString());
      } else {
        params.delete("page");
      }

      const newURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newURL, { scroll: false });
    },
    [router, pathname]
  );

  // Individual filter setters
  const setKeyword = useCallback(
    (keyword: string) => {
      const newFilters = { ...filters, q: keyword, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setIndustries = useCallback(
    (industries: Industry[]) => {
      const newFilters = { ...filters, industries, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setSizes = useCallback(
    (sizes: CompanySize[]) => {
      const newFilters = { ...filters, sizes, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setSort = useCallback(
    (newSort: CompanySortOption) => {
      const newFilters = { ...filters, sort: newSort, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setPage = useCallback(
    (newPage: number) => {
      const newFilters = { ...filters, page: newPage };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  // Batch update (for mobile filter apply)
  const updateFilters = useCallback(
    (newFilters: CompanyFilterState) => {
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [updateURL]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedFilters: CompanyFilterState = {
      q: "",
      industries: [],
      sizes: [],
      sort: "newest",
      page: 1,
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  }, [updateURL]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.q !== "" ||
    filters.industries.length > 0 ||
    filters.sizes.length > 0;

  return {
    filters,
    setKeyword,
    setIndustries,
    setSizes,
    setSort,
    setPage,
    updateFilters,
    clearAllFilters,
    hasActiveFilters,
  };
}
