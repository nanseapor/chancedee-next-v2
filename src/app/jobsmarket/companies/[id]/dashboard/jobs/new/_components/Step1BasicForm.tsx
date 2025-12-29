"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobFormData } from "@/types/jobsmarket/job-wizard.types";

export interface Step1BasicFormProps {
  formData: Partial<JobFormData>;
  errors: Record<string, string>;
  onFieldChange: (field: keyof JobFormData, value: any) => void;
}

const JOB_TYPES = [
  { value: "fulltime", label: "งานประจำ (Full-time)" },
  { value: "parttime", label: "งานพาร์ทไทม์ (Part-time)" },
  { value: "contract", label: "งานสัญญาจ้าง (Contract)" },
  { value: "internship", label: "งานฝึกงาน (Internship)" },
] as const;

const JOB_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
] as const;

/**
 * Step 1: Basic Information Form
 * Job title, type, level, positions, salary range
 */
export function Step1BasicForm({
  formData,
  errors,
  onFieldChange,
}: Step1BasicFormProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className={errors.title ? "text-red-600" : ""}>
          ชื่อตำแหน่งงาน <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title || ""}
          onChange={(e) => onFieldChange("title", e.target.value)}
          placeholder="เช่น Frontend Developer, Marketing Manager"
          className={errors.title ? "border-red-500 bg-red-50" : ""}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <Label htmlFor="jobType" className={errors.jobType ? "text-red-600" : ""}>
          ประเภทการจ้างงาน <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.jobType}
          onValueChange={(value) => onFieldChange("jobType", value)}
        >
          <SelectTrigger
            id="jobType"
            className={errors.jobType ? "border-red-500 bg-red-50" : ""}
          >
            <SelectValue placeholder="เลือกประเภทการจ้างงาน" />
          </SelectTrigger>
          <SelectContent>
            {JOB_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.jobType && (
          <p className="text-sm text-red-600">{errors.jobType}</p>
        )}
      </div>

      {/* Job Level */}
      <div className="space-y-2">
        <Label htmlFor="jobLevel" className={errors.jobLevel ? "text-red-600" : ""}>
          ระดับตำแหน่ง <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.jobLevel}
          onValueChange={(value) => onFieldChange("jobLevel", value)}
        >
          <SelectTrigger
            id="jobLevel"
            className={errors.jobLevel ? "border-red-500 bg-red-50" : ""}
          >
            <SelectValue placeholder="เลือกระดับตำแหน่ง" />
          </SelectTrigger>
          <SelectContent>
            {JOB_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.jobLevel && (
          <p className="text-sm text-red-600">{errors.jobLevel}</p>
        )}
      </div>

      {/* Number of Positions */}
      <div className="space-y-2">
        <Label
          htmlFor="numberOfPosition"
          className={errors.numberOfPosition ? "text-red-600" : ""}
        >
          จำนวนตำแหน่งที่รับ <span className="text-red-500">*</span>
        </Label>
        <Input
          id="numberOfPosition"
          type="number"
          min={1}
          value={formData.numberOfPosition || 1}
          onChange={(e) =>
            onFieldChange("numberOfPosition", parseInt(e.target.value) || 1)
          }
          className={errors.numberOfPosition ? "border-red-500 bg-red-50" : ""}
        />
        {errors.numberOfPosition && (
          <p className="text-sm text-red-600">{errors.numberOfPosition}</p>
        )}
      </div>

      {/* Department (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="department">
          แผนก/ฝ่าย{" "}
          <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
        </Label>
        <Input
          id="department"
          value={formData.department || ""}
          onChange={(e) => onFieldChange("department", e.target.value)}
          placeholder="เช่น Engineering, Sales, Marketing"
        />
      </div>

      {/* Salary Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hideSalary"
            checked={formData.hideSalary || false}
            onCheckedChange={(checked) =>
              onFieldChange("hideSalary", checked === true)
            }
          />
          <Label
            htmlFor="hideSalary"
            className="font-normal cursor-pointer"
          >
            ไม่แสดงเงินเดือน
          </Label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Min Salary */}
          <div className="space-y-2">
            <Label
              htmlFor="minSalary"
              className={errors.salary ? "text-red-600" : ""}
            >
              เงินเดือนต่ำสุด{" "}
              <span className="text-xs text-gray-500">(บาท/เดือน)</span>
            </Label>
            <Input
              id="minSalary"
              type="number"
              min={0}
              value={formData.minSalary || ""}
              onChange={(e) =>
                onFieldChange("minSalary", e.target.value ? parseInt(e.target.value) : undefined)
              }
              disabled={formData.hideSalary}
              placeholder="15,000"
              className={errors.salary ? "border-red-500 bg-red-50" : ""}
            />
          </div>

          {/* Max Salary */}
          <div className="space-y-2">
            <Label
              htmlFor="maxSalary"
              className={errors.salary ? "text-red-600" : ""}
            >
              เงินเดือนสูงสุด{" "}
              <span className="text-xs text-gray-500">(บาท/เดือน)</span>
            </Label>
            <Input
              id="maxSalary"
              type="number"
              min={0}
              value={formData.maxSalary || ""}
              onChange={(e) =>
                onFieldChange("maxSalary", e.target.value ? parseInt(e.target.value) : undefined)
              }
              disabled={formData.hideSalary}
              placeholder="30,000"
              className={errors.salary ? "border-red-500 bg-red-50" : ""}
            />
          </div>
        </div>

        {errors.salary && (
          <p className="text-sm text-red-600">{errors.salary}</p>
        )}
      </div>
    </div>
  );
}
