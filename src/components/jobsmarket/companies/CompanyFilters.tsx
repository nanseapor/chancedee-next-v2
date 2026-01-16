"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from "@/lib/constants/jobsmarket/company-filters";
import type {
  CompanyFilterState,
  Industry,
  CompanySize,
} from "@/types/public-companies";

interface CompanyFiltersProps {
  filters: CompanyFilterState;
  onFilterChange: (filters: CompanyFilterState) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

/**
 * CompanyFilters - Desktop filter sidebar for company directory
 *
 * @specification COMP-R09 Company Directory
 */
export function CompanyFilters({
  filters,
  onFilterChange,
  onClearAll,
  hasActiveFilters,
}: CompanyFiltersProps) {
  return (
    <aside className="w-72 shrink-0 space-y-4" data-testid="company-filters">
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <ActiveFiltersChips filters={filters} onFilterChange={onFilterChange} />
      )}

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="w-full"
          data-testid="clear-all-filters"
        >
          ล้างตัวกรองทั้งหมด
        </Button>
      )}

      {/* Industry Filter */}
      <FilterSection title="ประเภทธุรกิจ" defaultOpen>
        <CheckboxGroup
          options={INDUSTRY_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          selected={filters.industries}
          onChange={(industries) =>
            onFilterChange({
              ...filters,
              industries: industries as Industry[],
              page: 1,
            })
          }
          testIdPrefix="industry"
        />
      </FilterSection>

      {/* Company Size Filter */}
      <FilterSection title="ขนาดบริษัท" defaultOpen>
        <CheckboxGroup
          options={COMPANY_SIZE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          selected={filters.sizes}
          onChange={(sizes) =>
            onFilterChange({
              ...filters,
              sizes: sizes as CompanySize[],
              page: 1,
            })
          }
          testIdPrefix="size"
        />
      </FilterSection>
    </aside>
  );
}

/**
 * CompanyFiltersMobile - Mobile bottom sheet variant
 */
interface CompanyFiltersMobileProps extends CompanyFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  resultCount?: number;
}

export function CompanyFiltersMobile({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
  resultCount,
}: CompanyFiltersMobileProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh]" data-testid="mobile-company-filters">
        <SheetHeader>
          <SheetTitle>ตัวกรอง</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Industry Filter */}
          <FilterSection title="ประเภทธุรกิจ" defaultOpen>
            <CheckboxGroup
              options={INDUSTRY_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              selected={filters.industries}
              onChange={(industries) =>
                onFilterChange({
                  ...filters,
                  industries: industries as Industry[],
                  page: 1,
                })
              }
              testIdPrefix="industry-mobile"
            />
          </FilterSection>

          {/* Company Size Filter */}
          <FilterSection title="ขนาดบริษัท" defaultOpen>
            <CheckboxGroup
              options={COMPANY_SIZE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              selected={filters.sizes}
              onChange={(sizes) =>
                onFilterChange({
                  ...filters,
                  sizes: sizes as CompanySize[],
                  page: 1,
                })
              }
              testIdPrefix="size-mobile"
            />
          </FilterSection>
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onClearAll} className="flex-1">
            ล้างทั้งหมด
          </Button>
          <Button onClick={onClose} className="flex-1">
            ดู {resultCount || 0} บริษัท
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-b pb-4"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:underline">
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
  testIdPrefix,
}: {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  testIdPrefix?: string;
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
            id={`${testIdPrefix}-${option.value}`}
            data-testid={
              testIdPrefix ? `${testIdPrefix}-${option.value}` : undefined
            }
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label
            htmlFor={`${testIdPrefix}-${option.value}`}
            className="font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

function ActiveFiltersChips({
  filters,
  onFilterChange,
}: {
  filters: CompanyFilterState;
  onFilterChange: (filters: CompanyFilterState) => void;
}) {
  const chips: Array<{ label: string; onRemove: () => void }> = [];

  // Industries
  filters.industries.forEach((industry) => {
    const label =
      INDUSTRY_OPTIONS.find((opt) => opt.value === industry)?.label || industry;
    chips.push({
      label,
      onRemove: () =>
        onFilterChange({
          ...filters,
          industries: filters.industries.filter((i) => i !== industry),
          page: 1,
        }),
    });
  });

  // Sizes
  filters.sizes.forEach((size) => {
    const label =
      COMPANY_SIZE_OPTIONS.find((opt) => opt.value === size)?.label || size;
    chips.push({
      label,
      onRemove: () =>
        onFilterChange({
          ...filters,
          sizes: filters.sizes.filter((s) => s !== size),
          page: 1,
        }),
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" data-testid="active-filters">
      {chips.map((chip, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
    </div>
  );
}
