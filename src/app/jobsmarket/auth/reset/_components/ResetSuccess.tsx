"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResetSuccessProps {
  email: string;
  onResend: () => void;
}

/**
 * ResetSuccess - Success confirmation after password reset email sent
 * Per AUTH-R04 RIS §8.3 (SUCCESS state)
 *
 * Features:
 * - Shows submitted email for confirmation
 * - Primary action: Return to login
 * - Secondary action: Resend email
 */
export function ResetSuccess({ email, onResend }: ResetSuccessProps) {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push("/jobsmarket/auth/login");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <CardTitle className="text-2xl">ส่งลิงก์แล้ว</CardTitle>
        <CardDescription className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-center text-sm text-muted-foreground">
        <p>เราส่งลิงก์รีเซ็ตรหัสผ่านไปที่</p>
        <p className="font-medium text-foreground">{email}</p>
        <p className="mt-4">กรุณาตรวจสอบอีเมลของคุณ</p>
        <p className="text-xs">(อาจอยู่ในโฟลเดอร์สแปม)</p>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        {/* Primary Action - Per AUTH-R04 RIS §8.3 */}
        <Button type="button" className="w-full" onClick={handleBackToLogin}>
          กลับไปหน้าเข้าสู่ระบบ
        </Button>

        {/* Resend Link - Per AUTH-R04 RIS §8.3 */}
        <div className="text-center text-sm text-muted-foreground">
          ไม่ได้รับอีเมล?{" "}
          <button
            type="button"
            onClick={onResend}
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            ส่งอีกครั้ง
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
