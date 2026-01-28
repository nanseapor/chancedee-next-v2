"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Email login form validation schema
 * Per BLS-01 §3.1 Input Validation
 */
const emailLoginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน"),
});

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;

interface EmailLoginFormProps {
  onSubmit: (email: string, password: string) => void;
  disabled?: boolean;
  loading?: boolean;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  autoFocusEmail?: boolean;
}

/**
 * EmailLoginForm - Email/password form component
 * Per AUTH-R01 Implementation Plan §7 (Thai Copy)
 */
export function EmailLoginForm({
  onSubmit,
  disabled = false,
  loading = false,
  termsAccepted,
  onTermsChange,
  autoFocusEmail = false,
}: EmailLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (data: EmailLoginFormData) => {
    onSubmit(data.email, data.password);
  };

  const isDisabled = disabled || loading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อีเมล</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus={autoFocusEmail}
                  disabled={isDisabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>รหัสผ่าน</FormLabel>
                <Link
                  href="/auth/reset"
                  className="text-sm text-secondary-500 hover:text-secondary-600 hover:underline"
                  tabIndex={-1}
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                    disabled={isDisabled}
                    className="pr-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms checkbox */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => onTermsChange(checked === true)}
            disabled={isDisabled}
          />
          <Label
            htmlFor="terms"
            className="text-sm leading-relaxed cursor-pointer"
          >
            ยอมรับ{" "}
            <Link
              href="/legal/terms"
              className="text-secondary-500 hover:text-secondary-600 hover:underline"
              target="_blank"
            >
              ข้อกำหนดการใช้งาน
            </Link>{" "}
            และ{" "}
            <Link
              href="/privacy"
              className="text-secondary-500 hover:text-secondary-600 hover:underline"
              target="_blank"
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </Label>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-11"
          disabled={isDisabled}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default EmailLoginForm;
