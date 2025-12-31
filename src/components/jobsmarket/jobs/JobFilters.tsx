'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { ChevronDown, X } from 'lucide-react';
import {
  EMPLOYMENT_TYPES,
  EDUCATION_LEVELS,
  EXPERIENCE_RANGES,
  WORK_MODES,
  SALARY_PRESETS,
} from '@/lib/constants/jobsmarket/job-filters';
import { JobFilterState, EmploymentType, EducationLevel, ExperienceRange, WorkMode } from '@/types/public-jobs';
import { Badge } from '@/components/ui/badge';

interface JobFiltersProps {
  filters: JobFilterState;
  onFilterChange: (filters: JobFilterState) => void;
  onClearAll: () => void;
  resultCount?: number;
  isLoading?: boolean;
}

export function JobFilters({
  filters,
  onFilterChange,
  onClearAll,
}: JobFiltersProps) {
  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.locations.length > 0 ||
    filters.education.length > 0 ||
    filters.experience !== null ||
    filters.remote !== null ||
    filters.salaryMin !== null ||
    filters.salaryMax !== null;

  return (
    <aside className="w-72 shrink-0 space-y-4">
      {/* Active Filters Summary */}
      {hasActiveFilters && <ActiveFiltersChips filters={filters} onFilterChange={onFilterChange} />}

      {/* Clear All */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="w-full">
          ล้างตัวกรองทั้งหมด
        </Button>
      )}

      {/* Filter Sections */}
      <FilterSection title="ประเภทงาน" defaultOpen>
        <CheckboxGroup
          options={EMPLOYMENT_TYPES.map((type) => ({ value: type.value, label: type.label }))}
          selected={filters.types}
          onChange={(types) => onFilterChange({ ...filters, types: types as EmploymentType[] })}
        />
      </FilterSection>

      <FilterSection title="เงินเดือน" defaultOpen>
        <SalaryRangeFilter
          min={filters.salaryMin}
          max={filters.salaryMax}
          onChange={(min, max) => onFilterChange({ ...filters, salaryMin: min, salaryMax: max })}
        />
      </FilterSection>

      <FilterSection title="ประสบการณ์">
        <RadioGroup
          value={filters.experience || ''}
          onValueChange={(value) =>
            onFilterChange({ ...filters, experience: value ? (value as ExperienceRange) : null })
          }
        >
          {EXPERIENCE_RANGES.map((range) => (
            <div key={range.value} className="flex items-center space-x-2">
              <RadioGroupItem value={range.value} id={`exp-${range.value}`} />
              <Label htmlFor={`exp-${range.value}`} className="font-normal cursor-pointer">
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="การศึกษา">
        <CheckboxGroup
          options={EDUCATION_LEVELS.map((level) => ({ value: level.value, label: level.label }))}
          selected={filters.education}
          onChange={(education) => onFilterChange({ ...filters, education: education as EducationLevel[] })}
        />
      </FilterSection>

      <FilterSection title="รูปแบบการทำงาน">
        <RadioGroup
          value={filters.remote || ''}
          onValueChange={(value) => onFilterChange({ ...filters, remote: value ? (value as WorkMode) : null })}
        >
          {WORK_MODES.map((mode) => (
            <div key={mode.value} className="flex items-center space-x-2">
              <RadioGroupItem value={mode.value} id={`work-${mode.value}`} />
              <Label htmlFor={`work-${mode.value}`} className="font-normal cursor-pointer">
                {mode.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>
    </aside>
  );
}

// Mobile Bottom Sheet Variant
interface JobFiltersMobileProps extends JobFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JobFiltersMobile({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
  resultCount,
}: JobFiltersMobileProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>ตัวกรอง</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Same filter sections as desktop */}
          <FilterSection title="ประเภทงาน" defaultOpen>
            <CheckboxGroup
              options={EMPLOYMENT_TYPES.map((type) => ({ value: type.value, label: type.label }))}
              selected={filters.types}
              onChange={(types) => onFilterChange({ ...filters, types: types as EmploymentType[] })}
            />
          </FilterSection>

          <FilterSection title="เงินเดือน" defaultOpen>
            <SalaryRangeFilter
              min={filters.salaryMin}
              max={filters.salaryMax}
              onChange={(min, max) => onFilterChange({ ...filters, salaryMin: min, salaryMax: max })}
            />
          </FilterSection>

          <FilterSection title="ประสบการณ์">
            <RadioGroup
              value={filters.experience || ''}
              onValueChange={(value) =>
                onFilterChange({ ...filters, experience: value ? (value as ExperienceRange) : null })
              }
            >
              {EXPERIENCE_RANGES.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={range.value} id={`exp-mobile-${range.value}`} />
                  <Label htmlFor={`exp-mobile-${range.value}`} className="font-normal cursor-pointer">
                    {range.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FilterSection>

          <FilterSection title="การศึกษา">
            <CheckboxGroup
              options={EDUCATION_LEVELS.map((level) => ({ value: level.value, label: level.label }))}
              selected={filters.education}
              onChange={(education) => onFilterChange({ ...filters, education: education as EducationLevel[] })}
            />
          </FilterSection>

          <FilterSection title="รูปแบบการทำงาน">
            <RadioGroup
              value={filters.remote || ''}
              onValueChange={(value) => onFilterChange({ ...filters, remote: value ? (value as WorkMode) : null })}
            >
              {WORK_MODES.map((mode) => (
                <div key={mode.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode.value} id={`work-mobile-${mode.value}`} />
                  <Label htmlFor={`work-mobile-${mode.value}`} className="font-normal cursor-pointer">
                    {mode.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FilterSection>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onClearAll} className="flex-1">
            ล้างทั้งหมด
          </Button>
          <Button onClick={onClose} className="flex-1">
            ดู {resultCount || 0} งาน
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Helper Components

function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b pb-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:underline">
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label htmlFor={option.value} className="font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

function SalaryRangeFilter({
  min,
  max,
  onChange,
}: {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Presets */}
      <div className="space-y-2">
        {SALARY_PRESETS.map((preset) => (
          <button
            key={`${preset.min}-${preset.max}`}
            onClick={() => onChange(preset.min, preset.max)}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Clear button */}
      {(min !== null || max !== null) && (
        <Button variant="ghost" size="sm" onClick={() => onChange(null, null)} className="w-full">
          ล้างช่วงเงินเดือน
        </Button>
      )}
    </div>
  );
}

function ActiveFiltersChips({
  filters,
  onFilterChange,
}: {
  filters: JobFilterState;
  onFilterChange: (filters: JobFilterState) => void;
}) {
  const chips: Array<{ label: string; onRemove: () => void }> = [];

  // Types
  filters.types.forEach((type) => {
    const typeLabel = EMPLOYMENT_TYPES.find((t) => t.value === type)?.label || type;
    chips.push({
      label: typeLabel,
      onRemove: () =>
        onFilterChange({
          ...filters,
          types: filters.types.filter((t) => t !== type),
        }),
    });
  });

  // Education
  filters.education.forEach((edu) => {
    const eduLabel = EDUCATION_LEVELS.find((e) => e.value === edu)?.label || edu;
    chips.push({
      label: eduLabel,
      onRemove: () =>
        onFilterChange({
          ...filters,
          education: filters.education.filter((e) => e !== edu),
        }),
    });
  });

  // Experience
  if (filters.experience) {
    const expLabel = EXPERIENCE_RANGES.find((e) => e.value === filters.experience)?.label || filters.experience;
    chips.push({
      label: expLabel,
      onRemove: () => onFilterChange({ ...filters, experience: null }),
    });
  }

  // Work mode
  if (filters.remote) {
    const modeLabel = WORK_MODES.find((m) => m.value === filters.remote)?.label || filters.remote;
    chips.push({
      label: modeLabel,
      onRemove: () => onFilterChange({ ...filters, remote: null }),
    });
  }

  // Salary
  if (filters.salaryMin || filters.salaryMax) {
    const salaryLabel =
      filters.salaryMin && filters.salaryMax
        ? `฿${filters.salaryMin.toLocaleString()} - ฿${filters.salaryMax.toLocaleString()}`
        : filters.salaryMin
          ? `฿${filters.salaryMin.toLocaleString()}+`
          : `สูงสุด ฿${filters.salaryMax!.toLocaleString()}`;
    chips.push({
      label: salaryLabel,
      onRemove: () => onFilterChange({ ...filters, salaryMin: null, salaryMax: null }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          {chip.label}
          <button onClick={chip.onRemove} className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5">
            <X size={12} />
          </button>
        </Badge>
      ))}
    </div>
  );
}
