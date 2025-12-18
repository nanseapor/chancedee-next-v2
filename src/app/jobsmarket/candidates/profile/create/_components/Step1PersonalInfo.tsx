"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DistrictSelector } from "@/components/jobsmarket/profile/DistrictSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TITLE_PREFIXES,
  GENDERS,
  MARITAL_STATUSES,
} from "@/lib/constants/jobsmarket/personal-info";

/**
 * Step 1: Personal Information Form Schema
 * Based on CAND-R02 RIS Section 8.1
 */
const step1Schema = z.object({
  // Title and Name
  title_prefix: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
  first_name_th: z.string().min(1, "กรุณากรอกชื่อ").max(100, "ชื่อยาวเกินไป"),
  last_name_th: z.string().min(1, "กรุณากรอกนามสกุล").max(100, "นามสกุลยาวเกินไป"),
  nick_name_th: z.string().optional(),

  // Contact
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  phone_number: z
    .string()
    .regex(/^0\d{9}$/, "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"),

  // Personal Info
  birthdate: z.string().min(1, "กรุณาเลือกวันเกิด").refine(
    (date) => {
      const age = Math.floor(
        (new Date().getTime() - new Date(date).getTime()) / 3.15576e10
      );
      return age >= 18;
    },
    { message: "ต้องมีอายุ 18 ปีขึ้นไป" }
  ),
  gender: z.string().optional(),
  marital_status: z.string().optional(),

  // Address
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  district: z.string().optional(),
  address_line_1: z.string().optional(),
  post_code: z.string().regex(/^\d{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก").optional().or(z.literal("")),
});

export type Step1FormData = z.infer<typeof step1Schema>;

export interface Step1PersonalInfoProps {
  /** Initial form data (for draft resume) */
  initialData?: Partial<Step1FormData>;
  /** Callback when form is submitted */
  onSubmit: (data: Step1FormData) => void | Promise<void>;
  /** Callback to go back (if applicable) */
  onBack?: () => void;
  /** Show back button */
  showBackButton?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Step 1: Personal Information Form
 *
 * Used in CAND-R02 Profile Creation Wizard
 * Collects basic personal information required for profile
 *
 * Fields:
 * - Title, First Name, Last Name (Thai)
 * - Email, Phone
 * - Birthdate, Gender, Marital Status
 * - Province, District, Address, Postal Code
 */
export function Step1PersonalInfo({
  initialData,
  onSubmit,
  onBack,
  showBackButton = false,
  submitText = "ถัดไป",
  isLoading = false,
}: Step1PersonalInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData,
  });

  // Watch province and district for controlled components
  const province = watch("province");
  const district = watch("district");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">ข้อมูลส่วนตัว</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          กรอกข้อมูลส่วนตัวของคุณ เพื่อให้นายจ้างสามารถติดต่อคุณได้
        </p>
      </div>

      {/* Title and Name */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">ชื่อ-นามสกุล</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Title Prefix */}
          <div className="space-y-2">
            <Label htmlFor="title_prefix">
              คำนำหน้า <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("title_prefix")}
              onValueChange={(value) => setValue("title_prefix", value)}
            >
              <SelectTrigger id="title_prefix">
                <SelectValue placeholder="เลือก" />
              </SelectTrigger>
              <SelectContent>
                {TITLE_PREFIXES.map((prefix) => (
                  <SelectItem key={prefix.value} value={prefix.value}>
                    {prefix.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.title_prefix && (
              <p className="text-xs text-destructive">
                {errors.title_prefix.message}
              </p>
            )}
          </div>

          {/* First Name */}
          <div className="space-y-2 md:col-span-1.5">
            <Label htmlFor="first_name_th">
              ชื่อ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="first_name_th"
              placeholder="ชื่อ"
              {...register("first_name_th")}
            />
            {errors.first_name_th && (
              <p className="text-xs text-destructive">
                {errors.first_name_th.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2 md:col-span-1.5">
            <Label htmlFor="last_name_th">
              นามสกุล <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_name_th"
              placeholder="นามสกุล"
              {...register("last_name_th")}
            />
            {errors.last_name_th && (
              <p className="text-xs text-destructive">
                {errors.last_name_th.message}
              </p>
            )}
          </div>
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <Label htmlFor="nick_name_th">ชื่อเล่น</Label>
          <Input
            id="nick_name_th"
            placeholder="ชื่อเล่น (ถ้ามี)"
            {...register("nick_name_th")}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">ข้อมูลติดต่อ</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              อีเมล <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone_number">
              เบอร์โทรศัพท์ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone_number"
              type="tel"
              placeholder="0812345678"
              {...register("phone_number")}
            />
            {errors.phone_number && (
              <p className="text-xs text-destructive">
                {errors.phone_number.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">ข้อมูลส่วนบุคคล</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Birthdate */}
          <div className="space-y-2">
            <Label htmlFor="birthdate">
              วันเกิด <span className="text-destructive">*</span>
            </Label>
            <Input
              id="birthdate"
              type="date"
              {...register("birthdate")}
            />
            {errors.birthdate && (
              <p className="text-xs text-destructive">
                {errors.birthdate.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">เพศ</Label>
            <Select
              value={watch("gender")}
              onValueChange={(value) => setValue("gender", value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="เลือก" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marital Status */}
          <div className="space-y-2">
            <Label htmlFor="marital_status">สถานภาพสมรส</Label>
            <Select
              value={watch("marital_status")}
              onValueChange={(value) => setValue("marital_status", value)}
            >
              <SelectTrigger id="marital_status">
                <SelectValue placeholder="เลือก" />
              </SelectTrigger>
              <SelectContent>
                {MARITAL_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">ที่อยู่</h3>

        {/* Province and District */}
        <DistrictSelector
          province={province || ""}
          district={district || ""}
          onProvinceChange={(value) => setValue("province", value)}
          onDistrictChange={(value) => setValue("district", value)}
        />
        {errors.province && (
          <p className="text-xs text-destructive">{errors.province.message}</p>
        )}

        {/* Address Line */}
        <div className="space-y-2">
          <Label htmlFor="address_line_1">ที่อยู่</Label>
          <Input
            id="address_line_1"
            placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
            {...register("address_line_1")}
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="post_code">รหัสไปรษณีย์</Label>
          <Input
            id="post_code"
            placeholder="10100"
            maxLength={5}
            {...register("post_code")}
            className="max-w-xs"
          />
          {errors.post_code && (
            <p className="text-xs text-destructive">
              {errors.post_code.message}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        {showBackButton && onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
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
