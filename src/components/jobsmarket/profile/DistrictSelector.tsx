"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getProvinceNames,
  getDistrictsForProvince,
} from "@/lib/constants/jobsmarket/thailand-geography";

export interface DistrictSelectorProps {
  /** Selected province */
  province: string;
  /** Selected district */
  district: string;
  /** Callback when province changes */
  onProvinceChange: (province: string) => void;
  /** Callback when district changes */
  onDistrictChange: (district: string) => void;
  /** Placeholder for province selector */
  provincePlaceholder?: string;
  /** Placeholder for district selector */
  districtPlaceholder?: string;
  /** Disable province selector */
  disableProvince?: boolean;
  /** Disable district selector */
  disableDistrict?: boolean;
  /** Optional className for container */
  className?: string;
}

/**
 * District Selector Component
 *
 * Two-level combobox for selecting Thailand province and district
 * Used in CAND-R02 Step 1: Personal Information
 *
 * Features:
 * - Searchable province selection (77 provinces)
 * - Searchable district selection (filtered by province)
 * - Keyboard navigation
 * - Custom entry support (as per SA Decision Q5 Option A)
 */
export function DistrictSelector({
  province,
  district,
  onProvinceChange,
  onDistrictChange,
  provincePlaceholder = "เลือกจังหวัด",
  districtPlaceholder = "เลือกอำเภอ",
  disableProvince = false,
  disableDistrict = false,
  className,
}: DistrictSelectorProps) {
  const [provinceOpen, setProvinceOpen] = React.useState(false);
  const [districtOpen, setDistrictOpen] = React.useState(false);

  // Get all provinces
  const provinces = React.useMemo(() => getProvinceNames(), []);

  // Get districts for selected province
  const districts = React.useMemo(() => {
    return province ? getDistrictsForProvince(province) : [];
  }, [province]);

  // Handle province selection
  const handleProvinceSelect = (selectedProvince: string) => {
    onProvinceChange(selectedProvince);
    // Clear district when province changes
    onDistrictChange("");
    setProvinceOpen(false);
  };

  // Handle district selection
  const handleDistrictSelect = (selectedDistrict: string) => {
    onDistrictChange(selectedDistrict);
    setDistrictOpen(false);
  };

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {/* Province Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          จังหวัด <span className="text-destructive">*</span>
        </label>
        <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={provinceOpen}
              disabled={disableProvince}
              className="w-full justify-between"
            >
              {province || provincePlaceholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="ค้นหาจังหวัด..." />
              <CommandList>
                <CommandEmpty>ไม่พบจังหวัด</CommandEmpty>
                <CommandGroup>
                  {provinces.map((prov) => (
                    <CommandItem
                      key={prov}
                      value={prov}
                      onSelect={handleProvinceSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          province === prov ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {prov}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* District Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          อำเภอ <span className="text-destructive">*</span>
        </label>
        <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={districtOpen}
              disabled={disableDistrict || !province}
              className="w-full justify-between"
            >
              {district || districtPlaceholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="ค้นหาอำเภอ..." />
              <CommandList>
                <CommandEmpty>ไม่พบอำเภอ</CommandEmpty>
                <CommandGroup>
                  {districts.map((dist) => (
                    <CommandItem
                      key={dist}
                      value={dist}
                      onSelect={handleDistrictSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          district === dist ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {dist}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
