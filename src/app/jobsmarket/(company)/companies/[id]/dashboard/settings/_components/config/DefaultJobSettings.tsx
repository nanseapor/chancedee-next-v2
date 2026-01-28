"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// ============================================
// Types
// ============================================

interface DefaultJobSettingsData {
  default_location?: string;
  default_job_type?: string;
  auto_close_days?: number;
}

interface DefaultJobSettingsProps {
  initialData: DefaultJobSettingsData;
  onSubmit: (data: DefaultJobSettingsData) => void;
  disabled: boolean;
  isSubmitting?: boolean;
}

// ============================================
// Validation Schema
// ============================================

const formSchema = z.object({
  default_location: z.string().optional().or(z.literal("")),
  default_job_type: z.string().optional().or(z.literal("")),
  auto_close_days: z
    .number()
    .min(0, "ต้องเป็นตัวเลขบวก")
    .max(365, "ต้องไม่เกิน 365 วัน")
    .optional()
    .nullable(),
});

type FormData = z.infer<typeof formSchema>;

// ============================================
// Job Type Options
// ============================================

const jobTypeOptions = [
  { value: "full-time", label: "งานประจำ (Full-time)" },
  { value: "part-time", label: "งานพาร์ทไทม์ (Part-time)" },
  { value: "contract", label: "สัญญาจ้าง (Contract)" },
  { value: "internship", label: "ฝึกงาน (Internship)" },
  { value: "freelance", label: "ฟรีแลนซ์ (Freelance)" },
];

// ============================================
// Location Options
// ============================================

const locationOptions = [
  { value: "bangkok", label: "กรุงเทพมหานคร" },
  { value: "nonthaburi", label: "นนทบุรี" },
  { value: "pathum-thani", label: "ปทุมธานี" },
  { value: "samut-prakan", label: "สมุทรปราการ" },
  { value: "chiang-mai", label: "เชียงใหม่" },
  { value: "phuket", label: "ภูเก็ต" },
  { value: "remote", label: "ทำงานระยะไกล (Remote)" },
];

// ============================================
// Component
// ============================================

export function DefaultJobSettings({
  initialData,
  onSubmit,
  disabled,
  isSubmitting = false,
}: DefaultJobSettingsProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      default_location: initialData.default_location || "",
      default_job_type: initialData.default_job_type || "",
      auto_close_days: initialData.auto_close_days ?? 30,
    },
  });

  // Reset form when initialData values actually change (e.g., after refetch from DB)
  // Use primitive values as dependencies to avoid object reference issues
  useEffect(() => {
    form.reset({
      default_location: initialData.default_location || "",
      default_job_type: initialData.default_job_type || "",
      auto_close_days: initialData.auto_close_days ?? 30,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.default_location, initialData.default_job_type, initialData.auto_close_days]);

  const handleSubmit = (data: FormData) => {
    onSubmit({
      default_location: data.default_location || undefined,
      default_job_type: data.default_job_type || undefined,
      auto_close_days: data.auto_close_days ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Default Location */}
        <FormField
          control={form.control}
          name="default_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>พื้นที่เริ่มต้น</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกพื้นที่" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                พื้นที่เริ่มต้นสำหรับประกาศงานใหม่
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Default Job Type */}
        <FormField
          control={form.control}
          name="default_job_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภทงานเริ่มต้น</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทงาน" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                ประเภทงานเริ่มต้นสำหรับประกาศงานใหม่
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Auto Close Days */}
        <FormField
          control={form.control}
          name="auto_close_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ปิดประกาศอัตโนมัติ (วัน)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? parseInt(value, 10) : undefined);
                  }}
                  placeholder="30"
                  min={0}
                  max={365}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormDescription>
                จำนวนวันก่อนปิดประกาศอัตโนมัติ (0 = ไม่ปิดอัตโนมัติ)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={disabled || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก
              </>
            ) : (
              "บันทึก"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
