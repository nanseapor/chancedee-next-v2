/**
 * COMP-R08: Filter Panel Component
 *
 * Left panel (250px fixed width) containing all filter controls:
 * - Job selector (dropdown)
 * - Status checkboxes
 * - Sort selector
 * - Apply/Clear buttons
 *
 * Per COMP-R08 RIS §2.1 (Filter Panel) and §4.4 (Filter State)
 */

'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MasterJobApplicationStatuses } from '@/constants/application';
import type { ApplicationSortOption } from '@/types/jobsmarket/applications.types';
import type { FilterState } from './utils/filter-utils';

interface FilterPanelProps {
  companyId: string;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  asSheet?: boolean; // Phase 6: Remove wrapper when used in Sheet
}

/**
 * Status options with Thai labels
 */
const STATUS_OPTIONS = [
  { value: MasterJobApplicationStatuses.new, label: 'รอดำเนินการ' }, // 'applied'
  { value: MasterJobApplicationStatuses.read, label: 'ดูแล้ว' },
  { value: MasterJobApplicationStatuses.accepted, label: 'ตอบรับแล้ว' },
  { value: MasterJobApplicationStatuses.rejected, label: 'ปฏิเสธ' },
  { value: MasterJobApplicationStatuses.scheduled, label: 'นัดสัมภาษณ์' },
  { value: MasterJobApplicationStatuses.confirmed, label: 'ยืนยันแล้ว' },
  { value: MasterJobApplicationStatuses.withdraw, label: 'ถอนใบสมัคร' },
] as const;

/**
 * Sort options with Thai labels
 */
const SORT_OPTIONS: Array<{ value: ApplicationSortOption; label: string }> = [
  { value: 'newest', label: 'ล่าสุด' },
  { value: 'oldest', label: 'เก่าสุด' },
  { value: 'score_high', label: 'คะแนนสูงสุด' },
  { value: 'score_low', label: 'คะแนนต่ำสุด' },
];

export function FilterPanel({ companyId: _companyId, filters, onFiltersChange, asSheet = false }: FilterPanelProps) {
  const [jobId, setJobId] = useState<string>(filters.jobId || 'all');
  const [statuses, setStatuses] = useState<Set<MasterJobApplicationStatuses>>(
    new Set(filters.statuses)
  );
  const [sortBy, setSortBy] = useState<ApplicationSortOption>(filters.sortBy || 'newest');

  // Phase 2: Job dropdown will show placeholder
  // Phase 5: Will fetch actual jobs for company
  const jobs = [
    { uid: 'all', title: 'ทั้งหมด' },
    // TODO Phase 5: Fetch real jobs using webJobGetCompanyJobsList
  ];

  // Handle status checkbox toggle
  const handleStatusToggle = (status: MasterJobApplicationStatuses) => {
    const newStatuses = new Set(statuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    setStatuses(newStatuses);
  };

  // Handle "select all" statuses
  const handleSelectAllStatuses = () => {
    setStatuses(new Set(STATUS_OPTIONS.map((s) => s.value)));
  };

  // Handle "clear all" statuses
  const handleClearAllStatuses = () => {
    setStatuses(new Set());
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange({
      jobId: jobId === 'all' ? null : jobId,
      statuses: Array.from(statuses),
      sortBy,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setJobId('all');
    setStatuses(new Set());
    setSortBy('newest');

    onFiltersChange({
      jobId: null,
      statuses: [],
      sortBy: 'newest',
    });
  };

  const content = (
    <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide">
            ตัวกรอง
          </h2>
        </div>

        {/* Job Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 tracking-wider">
            ตำแหน่งงาน
          </Label>
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกตำแหน่ง" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.uid} value={job.uid}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 tracking-wider">
              สถานะ
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllStatuses}
                className="text-xs text-secondary-600 hover:text-secondary-800 tracking-widest"
              >
                ทั้งหมด
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button
                type="button"
                onClick={handleClearAllStatuses}
                className="text-xs text-secondary-600 hover:text-secondary-800 tracking-widest"
              >
                ล้าง
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {STATUS_OPTIONS.map((status) => (
              <div key={status.value} className="flex items-center gap-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={statuses.has(status.value)}
                  onCheckedChange={() => handleStatusToggle(status.value)}
                />
                <Label
                  htmlFor={`status-${status.value}`}
                  className="text-sm text-gray-700 tracking-wider cursor-pointer"
                >
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 tracking-wider">
            เรียงตาม
          </Label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as ApplicationSortOption)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
          <Button
            onClick={handleApplyFilters}
            className="w-full bg-secondary-900 hover:bg-secondary-800 text-white tracking-widest"
            size="sm"
          >
            ใช้ตัวกรอง
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full border-secondary-500 text-secondary-700 hover:bg-secondary-50 tracking-widest"
            size="sm"
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </div>
  );

  // Phase 6: Wrap with aside only when not in sheet
  if (asSheet) {
    return content;
  }

  return (
    <aside className="w-[250px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      {content}
    </aside>
  );
}
