"use client";

import { Building2, SearchX, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchQuery?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  onClearSearch: () => void;
}

/**
 * EmptyState - Shown when no companies match the search/filter criteria
 *
 * @specification COMP-R09 Company Directory
 */
export function EmptyState({
  searchQuery,
  hasFilters,
  onClearFilters,
  onClearSearch,
}: EmptyStateProps) {
  // Determine empty state type
  const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

  if (hasSearchQuery && hasFilters) {
    // Both search and filters active
    return (
      <div
        className="text-center py-12 px-4"
        data-testid="companies-empty-state"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
          <SearchX className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ไม่พบบริษัทที่ตรงกับเงื่อนไข
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          ไม่พบบริษัทที่ตรงกับคำค้น &quot;{searchQuery}&quot;
          และตัวกรองที่เลือก ลองปรับเงื่อนไขการค้นหาใหม่
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            <FilterX className="mr-2 h-4 w-4" />
            ล้างตัวกรอง
          </Button>
          <Button onClick={onClearSearch}>ล้างทั้งหมด</Button>
        </div>
      </div>
    );
  }

  if (hasSearchQuery) {
    // Only search active
    return (
      <div
        className="text-center py-12 px-4"
        data-testid="companies-empty-state"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
          <SearchX className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ไม่พบบริษัทที่ตรงกับคำค้น
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          ไม่พบบริษัทที่ตรงกับ &quot;{searchQuery}&quot;
          ลองค้นหาด้วยคำอื่น
        </p>
        <Button onClick={onClearSearch}>ล้างคำค้นหา</Button>
      </div>
    );
  }

  if (hasFilters) {
    // Only filters active
    return (
      <div
        className="text-center py-12 px-4"
        data-testid="companies-empty-state"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
          <FilterX className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ไม่พบบริษัทที่ตรงกับตัวกรอง
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          ลองปรับตัวกรองให้กว้างขึ้นเพื่อดูบริษัทเพิ่มเติม
        </p>
        <Button onClick={onClearFilters}>ล้างตัวกรอง</Button>
      </div>
    );
  }

  // No search or filters - general empty state
  return (
    <div className="text-center py-12 px-4" data-testid="companies-empty-state">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Building2 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        ยังไม่มีบริษัทในระบบ
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        ขณะนี้ยังไม่มีบริษัทที่ลงทะเบียนในระบบ กรุณากลับมาอีกครั้งในภายหลัง
      </p>
    </div>
  );
}
