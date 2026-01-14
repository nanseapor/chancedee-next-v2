"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { JOB_TYPES, AVAILABILITY, PROVINCES } from "@/lib/constants/jobsmarket/job-preferences";

/**
 * Step 5 Schema
 * Based on CAND-R02 RIS Section 8.5
 * All fields are required for onboarding completion
 */
const step5Schema = z.object({
  job_types: z.array(z.string()).min(1, "กรุณาเลือกประเภทงานอย่างน้อย 1 รายการ"),
  positions: z.array(z.string()).min(1, "กรุณาเพิ่มตำแหน่งที่สนใจอย่างน้อย 1 ตำแหน่ง").max(10, "สามารถเพิ่มตำแหน่งได้สูงสุด 10 ตำแหน่ง"),
  salary_min: z.number().min(0, "กรุณากรอกเงินเดือนขั้นต่ำ"),
  salary_max: z.number().min(0, "กรุณากรอกเงินเดือนสูงสุด"),
  locations: z.array(z.string()).min(1, "กรุณาเลือกพื้นที่ทำงานอย่างน้อย 1 แห่ง"),
  availability: z.string().min(1, "กรุณาเลือกความพร้อมเริ่มงาน"),
}).refine(
  (data) => data.salary_max >= data.salary_min,
  {
    message: "เงินเดือนสูงสุดต้องมากกว่าหรือเท่ากับขั้นต่ำ",
    path: ["salary_max"],
  }
);

export type Step5FormData = z.infer<typeof step5Schema>;

export interface Step5JobPreferencesProps {
  /** Initial form data (for draft resume) */
  initialData?: Partial<Step5FormData>;
  /** Callback when form is submitted */
  onSubmit: (data: Step5FormData) => void | Promise<void>;
  /** Callback to go back */
  onBack?: () => void;
  /** Show back button */
  showBackButton?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Step 5: Job Preferences Form
 *
 * Used in CAND-R02 Profile Creation Wizard
 * Collects job preferences (ALL required for onboarding completion)
 *
 * Fields:
 * - Job types (≥1 selected)
 * - Desired positions (≥1)
 * - Salary range (min ≤ max)
 * - Work locations (≥1)
 * - Availability
 */
export function Step5JobPreferences({
  initialData,
  onSubmit,
  onBack,
  showBackButton = true,
  submitText = "เสร็จสิ้น",
  isLoading = false,
}: Step5JobPreferencesProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      job_types: initialData?.job_types || [],
      positions: initialData?.positions || [],
      salary_min: initialData?.salary_min || 0,
      salary_max: initialData?.salary_max || 0,
      locations: initialData?.locations || [],
      availability: initialData?.availability || "",
    },
  });

  const jobTypes = watch("job_types") || [];
  const positions = watch("positions") || [];
  const locations = watch("locations") || [];
  const availability = watch("availability");

  // Position input state
  const [positionInput, setPositionInput] = React.useState("");

  // Location filter
  const [locationFilter, setLocationFilter] = React.useState("");
  const filteredProvinces = React.useMemo(() => {
    if (!locationFilter.trim()) return PROVINCES;
    return PROVINCES.filter((province) =>
      province.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }, [locationFilter]);

  // Toggle job type
  const handleJobTypeToggle = (jobType: string) => {
    const newTypes = jobTypes.includes(jobType)
      ? jobTypes.filter((t) => t !== jobType)
      : [...jobTypes, jobType];
    setValue("job_types", newTypes);
  };

  // Add position
  const handleAddPosition = () => {
    const trimmed = positionInput.trim();
    if (trimmed && !positions.includes(trimmed) && positions.length < 10) {
      setValue("positions", [...positions, trimmed]);
      setPositionInput("");
    }
  };

  // Remove position
  const handleRemovePosition = (index: number) => {
    setValue(
      "positions",
      positions.filter((_, i) => i !== index)
    );
  };

  // Toggle location
  const handleLocationToggle = (location: string) => {
    const newLocations = locations.includes(location)
      ? locations.filter((l) => l !== location)
      : [...locations, location];
    setValue("locations", newLocations);
  };

  // Handle Enter key for position
  const handlePositionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPosition();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">ความต้องการงาน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          บอกเราว่าคุณกำลังมองหางานประเภทไหน
        </p>
      </div>

      {/* Job Types */}
      <div className="space-y-2">
        <Label>
          ประเภทงาน <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-2">
          {JOB_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`job_type_${type.value}`}
                checked={jobTypes.includes(type.value)}
                onCheckedChange={() => handleJobTypeToggle(type.value)}
              />
              <Label
                htmlFor={`job_type_${type.value}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.job_types && (
          <p className="text-xs text-destructive">{errors.job_types.message}</p>
        )}
      </div>

      {/* Desired Positions */}
      <div className="space-y-2">
        <Label>
          ตำแหน่งที่สนใจ <span className="text-destructive">*</span>
        </Label>
        <div className="flex space-x-2">
          <Input
            placeholder="เช่น Software Engineer, Product Manager"
            value={positionInput}
            onChange={(e) => setPositionInput(e.target.value)}
            onKeyDown={handlePositionKeyDown}
            disabled={positions.length >= 10}
          />
          <Button
            type="button"
            onClick={handleAddPosition}
            disabled={!positionInput.trim() || positions.length >= 10}
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่ม
          </Button>
        </div>
        {errors.positions && (
          <p className="text-xs text-destructive">{errors.positions.message}</p>
        )}

        {/* Positions List */}
        {positions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {positions.map((position, index) => (
              <Badge key={index} variant="secondary" className="text-sm pr-1">
                {position}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-4 w-4 p-0 hover:text-destructive hover:bg-transparent"
                  onClick={() => handleRemovePosition(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salary_min">
            เงินเดือนขั้นต่ำ (บาท/เดือน) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="salary_min"
            type="number"
            min="0"
            step="1000"
            placeholder="15,000"
            {...register("salary_min", { valueAsNumber: true })}
          />
          {errors.salary_min && (
            <p className="text-xs text-destructive">{errors.salary_min.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary_max">
            เงินเดือนสูงสุด (บาท/เดือน) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="salary_max"
            type="number"
            min="0"
            step="1000"
            placeholder="30,000"
            {...register("salary_max", { valueAsNumber: true })}
          />
          {errors.salary_max && (
            <p className="text-xs text-destructive">{errors.salary_max.message}</p>
          )}
        </div>
      </div>

      {/* Work Locations */}
      <div className="space-y-2">
        <Label>
          พื้นที่ทำงานที่สนใจ <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="ค้นหาจังหวัด..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto rounded-md border p-4 space-y-2">
          {filteredProvinces.slice(0, 20).map((province) => (
            <div key={province} className="flex items-center space-x-2">
              <Checkbox
                id={`location_${province}`}
                checked={locations.includes(province)}
                onCheckedChange={() => handleLocationToggle(province)}
              />
              <Label
                htmlFor={`location_${province}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {province}
              </Label>
            </div>
          ))}
          {filteredProvinces.length === 0 && (
            <p className="text-sm text-muted-foreground">ไม่พบจังหวัดที่ค้นหา</p>
          )}
          {filteredProvinces.length > 20 && (
            <p className="text-xs text-muted-foreground">
              แสดง 20 รายการแรก - พิมพ์เพื่อค้นหาเพิ่มเติม
            </p>
          )}
        </div>
        {errors.locations && (
          <p className="text-xs text-destructive">{errors.locations.message}</p>
        )}

        {/* Selected Locations */}
        {locations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {locations.map((location, index) => (
              <Badge key={index} variant="secondary" className="text-sm pr-1">
                {location}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-4 w-4 p-0 hover:text-destructive hover:bg-transparent"
                  onClick={() => handleLocationToggle(location)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <Label htmlFor="availability">
          ความพร้อมเริ่มงาน <span className="text-destructive">*</span>
        </Label>
        <Select
          value={availability}
          onValueChange={(value) => setValue("availability", value)}
        >
          <SelectTrigger id="availability">
            <SelectValue placeholder="เลือกความพร้อม" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABILITY.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.availability && (
          <p className="text-xs text-destructive">{errors.availability.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        {showBackButton && onBack ? (
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            ย้อนกลับ
          </Button>
        ) : (
          <div />
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "กำลังบันทึก..." : submitText}
        </Button>
      </div>
    </form>
  );
}
