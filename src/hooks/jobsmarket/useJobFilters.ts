import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type {
  JobFilterState,
  EmploymentType,
  EducationLevel,
  ExperienceRange,
  WorkMode,
  JobSortOption,
} from '@/types/public-jobs';

export interface UseJobFiltersProps {
  initialFilters: {
    keyword: string;
    locations: string[];
    types: EmploymentType[];
    salaryMin: number | null;
    salaryMax: number | null;
    education: EducationLevel[];
    experience: ExperienceRange | null;
    remote: WorkMode | null;
  };
  initialSort: JobSortOption;
  initialPage: number;
}

export interface UseJobFiltersReturn {
  // Current filter state
  filters: JobFilterState;

  // Filter update functions
  setKeyword: (keyword: string) => void;
  setLocations: (locations: string[]) => void;
  setTypes: (types: EmploymentType[]) => void;
  setSalaryRange: (min: number | null, max: number | null) => void;
  setEducation: (education: EducationLevel[]) => void;
  setExperience: (experience: ExperienceRange | null) => void;
  setRemote: (remote: WorkMode | null) => void;
  setSort: (sort: JobSortOption) => void;
  setPage: (page: number) => void;

  // Batch operations
  updateFilters: (newFilters: JobFilterState) => void;
  clearAllFilters: () => void;

  // Utility
  hasActiveFilters: boolean;
}

/**
 * Hook for managing job search filter state and URL synchronization
 *
 * Uses window.location.search directly to avoid stale closure issues
 * (learned from COMP-R08 implementation)
 *
 * @param props - Initial filter state from URL params
 * @returns Filter state and update functions
 */
export function useJobFilters({
  initialFilters,
  initialSort,
  initialPage,
}: UseJobFiltersProps): UseJobFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();

  // Convert keyword to q for JobFilterState
  const initialState: JobFilterState = {
    q: initialFilters.keyword,
    locations: initialFilters.locations,
    types: initialFilters.types,
    salaryMin: initialFilters.salaryMin,
    salaryMax: initialFilters.salaryMax,
    education: initialFilters.education,
    experience: initialFilters.experience,
    remote: initialFilters.remote,
    sort: initialSort,
    page: initialPage,
  };

  // Local state
  const [filters, setFilters] = useState<JobFilterState>(initialState);

  // Sync URL with filter state
  const updateURL = useCallback(
    (newFilters: JobFilterState) => {
      // Use window.location.search directly to avoid stale closure
      const params = new URLSearchParams(window.location.search);

      // Keyword
      if (newFilters.q) {
        params.set('q', newFilters.q);
      } else {
        params.delete('q');
      }

      // Locations
      if (newFilters.locations.length > 0) {
        params.delete('location');
        newFilters.locations.forEach((loc) => params.append('location', loc));
      } else {
        params.delete('location');
      }

      // Types
      if (newFilters.types.length > 0) {
        params.delete('type');
        newFilters.types.forEach((type) => params.append('type', type));
      } else {
        params.delete('type');
      }

      // Salary
      if (newFilters.salaryMin !== null) {
        params.set('salary_min', newFilters.salaryMin.toString());
      } else {
        params.delete('salary_min');
      }

      if (newFilters.salaryMax !== null) {
        params.set('salary_max', newFilters.salaryMax.toString());
      } else {
        params.delete('salary_max');
      }

      // Education
      if (newFilters.education.length > 0) {
        params.delete('education');
        newFilters.education.forEach((edu) => params.append('education', edu));
      } else {
        params.delete('education');
      }

      // Experience
      if (newFilters.experience) {
        params.set('experience', newFilters.experience);
      } else {
        params.delete('experience');
      }

      // Remote
      if (newFilters.remote) {
        params.set('remote', newFilters.remote);
      } else {
        params.delete('remote');
      }

      // Sort (only include if not default)
      if (newFilters.sort !== 'newest') {
        params.set('sort', newFilters.sort);
      } else {
        params.delete('sort');
      }

      // Page (only include if not first page)
      if (newFilters.page > 1) {
        params.set('page', newFilters.page.toString());
      } else {
        params.delete('page');
      }

      const newURL = `${pathname}?${params.toString()}`;
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

  const setLocations = useCallback(
    (locations: string[]) => {
      const newFilters = { ...filters, locations, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setTypes = useCallback(
    (types: EmploymentType[]) => {
      const newFilters = { ...filters, types, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setSalaryRange = useCallback(
    (salaryMin: number | null, salaryMax: number | null) => {
      const newFilters = { ...filters, salaryMin, salaryMax, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setEducation = useCallback(
    (education: EducationLevel[]) => {
      const newFilters = { ...filters, education, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setExperience = useCallback(
    (experience: ExperienceRange | null) => {
      const newFilters = { ...filters, experience, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setRemote = useCallback(
    (remote: WorkMode | null) => {
      const newFilters = { ...filters, remote, page: 1 };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  const setSort = useCallback(
    (newSort: JobSortOption) => {
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
    (newFilters: JobFilterState) => {
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [updateURL]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedFilters: JobFilterState = {
      q: '',
      locations: [],
      types: [],
      salaryMin: null,
      salaryMax: null,
      education: [],
      experience: null,
      remote: null,
      sort: 'newest',
      page: 1,
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  }, [updateURL]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.q !== '' ||
    filters.locations.length > 0 ||
    filters.types.length > 0 ||
    filters.salaryMin !== null ||
    filters.salaryMax !== null ||
    filters.education.length > 0 ||
    filters.experience !== null ||
    filters.remote !== null;

  return {
    filters,
    setKeyword,
    setLocations,
    setTypes,
    setSalaryRange,
    setEducation,
    setExperience,
    setRemote,
    setSort,
    setPage,
    updateFilters,
    clearAllFilters,
    hasActiveFilters,
  };
}
