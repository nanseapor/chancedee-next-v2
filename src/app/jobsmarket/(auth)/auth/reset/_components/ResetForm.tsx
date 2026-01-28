"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, ArrowLeft } from "lucide-react";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResetSchema } from "@/lib/validations/auth";

/**
 * Error type from ResetClient
 */
interface ResetError {
  code: string;
  message: string;
  showRegisterLink?: boolean;
}

interface ResetFormProps {
  initialEmail: string;
  isSubmitting: boolean;
  error: ResetError | null;
  onSubmit: (email: string) => void;
}

type ResetFormData = z.infer<typeof ResetSchema>;

/**
 * ResetForm - Email input form for password reset
 * Per AUTH-R04 RIS §8.1, §8.4 (IDLE and ERROR states)
 *
 * Features:
 * - Email validation (Zod schema)
 * - Pre-fill from query param
 * - Loading state during submission
 * - Error display with recovery actions
 */
export function ResetForm({
  initialEmail,
  isSubmitting,
  error,
  onSubmit,
}: ResetFormProps) {
  const router = useRouter();
  const [localEmail, setLocalEmail] = useState(initialEmail);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetFormData>({
    resolver: zodResolver(ResetSchema),
    mode: "onChange",
    defaultValues: {
      email: initialEmail,
    },
  });

  const onFormSubmit = (data: ResetFormData) => {
    setLocalEmail(data.email);
    onSubmit(data.email);
  };

  const handleBack = () => {
    router.push("/auth/login");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-secondary-700" />
          </div>
        </div>
        <CardTitle className="text-2xl">ลืมรหัสผ่าน</CardTitle>
        <CardDescription className="text-center">
          กรอกอีเมลที่ใช้ลงทะเบียน
          <br />
          เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardContent className="space-y-4">
          {/* Error Display - Per AUTH-R04 RIS §10 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p>{error.message}</p>

                {/* Show register link for user-not-found - Per AUTH-R04 RIS §10.3 */}
                {error.showRegisterLink && (
                  <div className="mt-2">
                    <p className="text-sm">อีเมลนี้ยังไม่ได้ลงทะเบียน</p>
                    <Link
                      href={`/auth/register?email=${encodeURIComponent(localEmail)}`}
                      className="text-sm font-medium underline underline-offset-4 hover:text-primary"
                    >
                      สร้างบัญชีใหม่
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Email Input - Per AUTH-R04 RIS §8.1 */}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล *</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              disabled={isSubmitting}
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-destructive flex items-start gap-1.5"
              >
                <AlertCircle className="h-4 w-4 mt-0.5" />
                {errors.email.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Submit Button - Per AUTH-R04 RIS §8.1 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                กำลังส่ง...
              </>
            ) : (
              "ส่งลิงก์รีเซ็ต"
            )}
          </Button>

          {/* Back Link - Per AUTH-R04 RIS §8.1 */}
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
