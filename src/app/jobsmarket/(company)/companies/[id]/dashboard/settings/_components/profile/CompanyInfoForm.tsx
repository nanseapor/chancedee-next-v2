"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// ============================================
// Types
// ============================================

interface CompanyInfoData {
  uid?: string;
  company_name: string;
  company_name_en?: string;
  industry?: string;
  company_size?: "S" | "M" | "L";
  founded_year?: number;
  description?: string;
}

interface CompanyInfoFormProps {
  initialData: CompanyInfoData;
  onSubmit: (data: CompanyInfoData) => void;
  disabled: boolean;
  isSubmitting?: boolean;
}

// ============================================
// Validation Schema
// ============================================

const formSchema = z.object({
  company_name: z.string().min(1, "กรุณาระบุชื่อบริษัท").max(200, "ชื่อบริษัทยาวเกินไป"),
  company_name_en: z.string().max(200, "ชื่อบริษัทยาวเกินไป").optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  company_size: z.enum(["S", "M", "L"]).optional(),
  founded_year: z
    .number()
    .min(1800, "ปีไม่ถูกต้อง")
    .max(new Date().getFullYear(), "ปีไม่ถูกต้อง")
    .optional()
    .nullable(),
  description: z.string().max(5000, "คำอธิบายยาวเกินไป").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

// ============================================
// Industry Options
// ============================================

const industryOptions = [
  { value: "technology", label: "เทคโนโลยีและสารสนเทศ" },
  { value: "finance", label: "การเงินและธนาคาร" },
  { value: "healthcare", label: "สุขภาพและการแพทย์" },
  { value: "education", label: "การศึกษา" },
  { value: "retail", label: "ค้าปลีก" },
  { value: "manufacturing", label: "การผลิต" },
  { value: "hospitality", label: "การโรงแรมและท่องเที่ยว" },
  { value: "construction", label: "ก่อสร้างและอสังหาริมทรัพย์" },
  { value: "logistics", label: "โลจิสติกส์และขนส่ง" },
  { value: "other", label: "อื่นๆ" },
];

// ============================================
// Component
// ============================================

export function CompanyInfoForm({
  initialData,
  onSubmit,
  disabled,
  isSubmitting = false,
}: CompanyInfoFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: initialData.company_name || "",
      company_name_en: initialData.company_name_en || "",
      industry: initialData.industry || "",
      company_size: initialData.company_size,
      founded_year: initialData.founded_year ?? undefined,
      description: initialData.description || "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      uid: initialData.uid,
      founded_year: data.founded_year ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Company Name (Thai) */}
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                ชื่อบริษัท <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ระบุชื่อบริษัท"
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Name (English) */}
        <FormField
          control={form.control}
          name="company_name_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อบริษัท (ภาษาอังกฤษ)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Company name in English"
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Industry */}
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อุตสาหกรรม</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอุตสาหกรรม" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Size */}
        <FormField
          control={form.control}
          name="company_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ขนาดบริษัท</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกขนาดบริษัท" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="S">เล็ก (1-50 คน)</SelectItem>
                  <SelectItem value="M">กลาง (51-200 คน)</SelectItem>
                  <SelectItem value="L">ใหญ่ (มากกว่า 200 คน)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Founded Year */}
        <FormField
          control={form.control}
          name="founded_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ปีที่ก่อตั้ง</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value ? parseInt(value, 10) : undefined);
                  }}
                  placeholder="เช่น 2020"
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description (Plain Text) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รายละเอียดบริษัท</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="อธิบายเกี่ยวกับบริษัทของคุณ"
                  rows={5}
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <div className="text-right text-xs text-gray-500">
                {(field.value?.length || 0).toLocaleString()}/5,000
              </div>
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
