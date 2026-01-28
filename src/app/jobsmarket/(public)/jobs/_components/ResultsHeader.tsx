'use client';

import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { JobSortOption } from '@/types/public-jobs';
import { JOB_SORT_OPTIONS } from '@/lib/constants/jobsmarket/job-filters';

export interface ResultsHeaderProps {
  totalCount: number;
  currentSort: JobSortOption;
  onSortChange: (sort: JobSortOption) => void;
  isLoading: boolean;
  isFallback: boolean;
}

export function ResultsHeader({
  totalCount,
  currentSort,
  onSortChange,
  isLoading,
  isFallback,
}: ResultsHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <span>กำลังค้นหา...</span>
          ) : (
            <span>
              พบ <span className="font-medium text-gray-900">{totalCount.toLocaleString()}</span> ตำแหน่ง
            </span>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">เรียงตาม:</span>
          <Select value={currentSort} onValueChange={(value) => onSortChange(value as JobSortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fallback Warning */}
      {isFallback && !isLoading && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            ระบบค้นหาหลักไม่พร้อมใช้งาน กำลังใช้ระบบสำรอง ผลลัพธ์อาจใช้เวลานานกว่าปกติ
          </p>
        </div>
      )}
    </div>
  );
}
