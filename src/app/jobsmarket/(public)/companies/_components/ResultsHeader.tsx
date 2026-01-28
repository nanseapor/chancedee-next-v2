"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanySortOption } from "@/types/public-companies";
import { COMPANY_SORT_OPTIONS } from "@/lib/constants/jobsmarket/company-filters";

export interface ResultsHeaderProps {
  totalCount: number;
  currentSort: CompanySortOption;
  onSortChange: (sort: CompanySortOption) => void;
  isLoading: boolean;
}

/**
 * ResultsHeader - Shows result count and sort options
 *
 * @specification COMP-R09 Company Directory
 */
export function ResultsHeader({
  totalCount,
  currentSort,
  onSortChange,
  isLoading,
}: ResultsHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        {/* Results Count */}
        <div className="text-sm text-gray-600" data-testid="results-count">
          {isLoading ? (
            <span>กำลังค้นหา...</span>
          ) : (
            <span>
              พบ{" "}
              <span className="font-medium text-gray-900">
                {totalCount.toLocaleString()}
              </span>{" "}
              บริษัท
            </span>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">
            เรียงตาม:
          </span>
          <Select
            value={currentSort}
            onValueChange={(value) => onSortChange(value as CompanySortOption)}
          >
            <SelectTrigger className="w-[180px]" data-testid="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
