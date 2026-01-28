import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import { useCompanyFilters } from "@/hooks/jobsmarket/useCompanyFilters";
import type { CompanyFilterState, Industry, CompanySize } from "@/types/public-companies";

/**
 * Unit tests for useCompanyFilters hook
 *
 * @specification COMP-R09 Company Directory
 *
 * Tests cover:
 * - Initial state from props
 * - Individual filter setters
 * - URL synchronization
 * - Clear all filters
 * - hasActiveFilters computation
 */

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

describe("useCompanyFilters", () => {
  const mockRouter = {
    replace: vi.fn(),
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/companies");

    // Mock window.location.search
    Object.defineProperty(window, "location", {
      value: {
        search: "",
        pathname: "/companies",
      },
      writable: true,
    });
  });

  describe("Initialization", () => {
    it("should initialize with default values when no filters provided", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      expect(result.current.filters).toEqual({
        q: "",
        industries: [],
        sizes: [],
        sort: "newest",
        page: 1,
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should initialize with provided filter values", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: {
            keyword: "test company",
            industries: ["technology"] as Industry[],
            sizes: ["M"] as CompanySize[],
          },
          initialSort: "alphabetical",
          initialPage: 2,
        })
      );

      expect(result.current.filters.q).toBe("test company");
      expect(result.current.filters.industries).toEqual(["technology"]);
      expect(result.current.filters.sizes).toEqual(["M"]);
      expect(result.current.filters.sort).toBe("alphabetical");
      expect(result.current.filters.page).toBe(2);
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("setKeyword", () => {
    it("should update keyword and reset page to 1", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 3,
        })
      );

      act(() => {
        result.current.setKeyword("google");
      });

      expect(result.current.filters.q).toBe("google");
      expect(result.current.filters.page).toBe(1);
    });

    it("should update URL with keyword", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      act(() => {
        result.current.setKeyword("test");
      });

      expect(mockRouter.replace).toHaveBeenCalled();
    });

    it("should set hasActiveFilters true when keyword is not empty", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.setKeyword("test");
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("setIndustries", () => {
    it("should update industries filter and reset page", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 2,
        })
      );

      act(() => {
        result.current.setIndustries(["technology", "finance"] as Industry[]);
      });

      expect(result.current.filters.industries).toEqual(["technology", "finance"]);
      expect(result.current.filters.page).toBe(1);
    });

    it("should set hasActiveFilters true when industries selected", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      act(() => {
        result.current.setIndustries(["retail"] as Industry[]);
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("setSizes", () => {
    it("should update sizes filter and reset page", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 3,
        })
      );

      act(() => {
        result.current.setSizes(["S", "L"] as CompanySize[]);
      });

      expect(result.current.filters.sizes).toEqual(["S", "L"]);
      expect(result.current.filters.page).toBe(1);
    });
  });

  describe("setSort", () => {
    it("should update sort option and reset page", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 2,
        })
      );

      act(() => {
        result.current.setSort("most_jobs");
      });

      expect(result.current.filters.sort).toBe("most_jobs");
      expect(result.current.filters.page).toBe(1);
    });
  });

  describe("setPage", () => {
    it("should update page without resetting other filters", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "test", industries: ["technology"] as Industry[], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.filters.page).toBe(5);
      expect(result.current.filters.q).toBe("test");
      expect(result.current.filters.industries).toEqual(["technology"]);
    });
  });

  describe("updateFilters (batch update)", () => {
    it("should update all filters at once", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      const newFilters: CompanyFilterState = {
        q: "tech company",
        industries: ["technology", "finance"] as Industry[],
        sizes: ["L"] as CompanySize[],
        sort: "alphabetical",
        page: 2,
      };

      act(() => {
        result.current.updateFilters(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
    });
  });

  describe("clearAllFilters", () => {
    it("should reset all filters to default values", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: {
            keyword: "test",
            industries: ["technology"] as Industry[],
            sizes: ["S"] as CompanySize[],
          },
          initialSort: "alphabetical",
          initialPage: 5,
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.filters).toEqual({
        q: "",
        industries: [],
        sizes: [],
        sort: "newest",
        page: 1,
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("hasActiveFilters", () => {
    it("should be false when no filters are active", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should be true when keyword is set", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "test", industries: [], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should be true when industries are selected", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: ["technology"] as Industry[], sizes: [] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should be true when sizes are selected", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: ["M"] as CompanySize[] },
          initialSort: "newest",
          initialPage: 1,
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should not consider sort or page as active filters", () => {
      const { result } = renderHook(() =>
        useCompanyFilters({
          initialFilters: { keyword: "", industries: [], sizes: [] },
          initialSort: "alphabetical", // Not default
          initialPage: 5, // Not 1
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });
});
