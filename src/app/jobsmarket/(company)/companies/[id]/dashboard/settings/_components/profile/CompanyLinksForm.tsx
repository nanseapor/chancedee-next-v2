"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Globe, Facebook, Linkedin } from "lucide-react";

// ============================================
// Types
// ============================================

interface CompanyLinksData {
  website?: string;
  facebook?: string;
  linkedin?: string;
}

interface CompanyLinksFormProps {
  initialData: CompanyLinksData;
  onSubmit: (data: CompanyLinksData) => void;
  disabled: boolean;
  isSubmitting?: boolean;
}

// ============================================
// Validation Schema
// ============================================

const formSchema = z.object({
  website: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  facebook: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

// ============================================
// Component
// ============================================

export function CompanyLinksForm({
  initialData,
  onSubmit,
  disabled,
  isSubmitting = false,
}: CompanyLinksFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website: initialData.website || "",
      facebook: initialData.facebook || "",
      linkedin: initialData.linkedin || "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit({
      website: data.website || "",
      facebook: data.facebook || "",
      linkedin: data.linkedin || "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                เว็บไซต์
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="https://www.example.com"
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Facebook */}
        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="https://facebook.com/yourcompany"
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* LinkedIn */}
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="https://linkedin.com/company/yourcompany"
                  disabled={disabled || isSubmitting}
                />
              </FormControl>
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
