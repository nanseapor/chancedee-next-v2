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
import { EDUCATION_LEVELS } from "@/lib/constants/jobsmarket/education";

/**
 * Education Entry Schema
 * Based on CAND-R02 RIS Section 8.3
 */
const educationSchema = z.object({
  level: z.string().min(1, "กรุณาเลือกระดับการศึกษา"),
  institution: z.string().min(1, "กรุณากรอกชื่อสถาบัน").max(200, "ชื่อสถาบันยาวเกินไป"),
  faculty: z.string().min(1, "กรุณากรอกคณะ/สาขา").max(100, "คณะ/สาขายาวเกินไป"),
  graduation_year: z.number().min(1950, "ปีไม่ถูกต้อง").max(new Date().getFullYear() + 5, "ปีไม่ถูกต้อง"),
  gpa: z.number().min(0, "เกรดเฉลี่ยต้องมากกว่าหรือเท่ากับ 0").max(4, "เกรดเฉลี่ยต้องน้อยกว่าหรือเท่ากับ 4").optional(),
});

/**
 * Step 3 Schema
 * Requires exactly 1 education entry (highest level)
 */
const step3Schema = z.object({
  education: educationSchema,
});

export type Education = z.infer<typeof educationSchema>;
export type Step3FormData = z.infer<typeof step3Schema>;

export interface Step3EducationProps {
  /** Initial form data (for draft resume) */
  initialData?: Partial<Step3FormData>;
  /** Callback when form is submitted */
  onSubmit: (data: Step3FormData) => void | Promise<void>;
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
 * Step 3: Education Form
 *
 * Used in CAND-R02 Profile Creation Wizard
 * Collects highest education level (exactly 1 entry required)
 *
 * Fields:
 * - Education level (dropdown)
 * - Institution name
 * - Faculty/Major
 * - Graduation year
 * - GPA (optional, 0.00-4.00)
 */
export function Step3Education({
  initialData,
  onSubmit,
  onBack,
  showBackButton = true,
  submitText = "ถัดไป",
  isLoading = false,
}: Step3EducationProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: initialData || {
      education: {
        level: "",
        institution: "",
        faculty: "",
        graduation_year: new Date().getFullYear(),
        gpa: undefined,
      },
    },
  });

  const educationLevel = watch("education.level");

  // Generate year options (1950 - current year + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: (currentYear + 5) - 1950 + 1 }, (_, i) => currentYear + 5 - i);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">ประวัติการศึกษา</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          กรอกข้อมูลการศึกษาสูงสุดของคุณ
        </p>
      </div>

      {/* Education Level */}
      <div className="space-y-2">
        <Label htmlFor="education_level">
          ระดับการศึกษา <span className="text-destructive">*</span>
        </Label>
        <Select
          value={educationLevel}
          onValueChange={(value) => setValue("education.level", value)}
        >
          <SelectTrigger id="education_level">
            <SelectValue placeholder="เลือกระดับการศึกษา" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.education?.level && (
          <p className="text-xs text-destructive">{errors.education.level.message}</p>
        )}
      </div>

      {/* Institution */}
      <div className="space-y-2">
        <Label htmlFor="education_institution">
          สถาบันการศึกษา <span className="text-destructive">*</span>
        </Label>
        <Input
          id="education_institution"
          placeholder="มหาวิทยาลัย / วิทยาลัย"
          {...register("education.institution")}
        />
        {errors.education?.institution && (
          <p className="text-xs text-destructive">{errors.education.institution.message}</p>
        )}
      </div>

      {/* Faculty/Major */}
      <div className="space-y-2">
        <Label htmlFor="education_faculty">
          คณะ / สาขา <span className="text-destructive">*</span>
        </Label>
        <Input
          id="education_faculty"
          placeholder="วิศวกรรมศาสตร์ / วิทยาศาสตร์คอมพิวเตอร์"
          {...register("education.faculty")}
        />
        {errors.education?.faculty && (
          <p className="text-xs text-destructive">{errors.education.faculty.message}</p>
        )}
      </div>

      {/* Graduation Year */}
      <div className="space-y-2">
        <Label htmlFor="education_graduation_year">
          ปีที่จบการศึกษา <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("education.graduation_year")?.toString()}
          onValueChange={(value) => setValue("education.graduation_year", parseInt(value))}
        >
          <SelectTrigger id="education_graduation_year">
            <SelectValue placeholder="เลือกปี" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.education?.graduation_year && (
          <p className="text-xs text-destructive">{errors.education.graduation_year.message}</p>
        )}
      </div>

      {/* GPA (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="education_gpa">
          เกรดเฉลี่ย (GPA)
        </Label>
        <Input
          id="education_gpa"
          type="number"
          step="0.01"
          min="0"
          max="4"
          placeholder="0.00 - 4.00"
          {...register("education.gpa", {
            setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : parseFloat(v)),
          })}
          className="max-w-xs"
        />
        {errors.education?.gpa && (
          <p className="text-xs text-destructive">{errors.education.gpa.message}</p>
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
