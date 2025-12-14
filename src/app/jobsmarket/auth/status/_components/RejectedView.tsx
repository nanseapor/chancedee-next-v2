"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * RejectedView - Shows when company registration was rejected
 * Per AUTH-R05 RIS §5.4 (REJECTED state)
 *
 * Features:
 * - Shows rejection reason from ?reason query param
 * - Shows company name from ?company query param
 * - Primary action: Return to dashboard or login
 */
export function RejectedView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reason = searchParams.get("reason");
  const companyName = searchParams.get("company");

  const handleBackToDashboard = () => {
    router.push("/jobsmarket/dashboard");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-2xl">คำขอถูกปฏิเสธ</CardTitle>
        <CardDescription className="text-center">
          Application Rejected
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {companyName && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">บริษัท</p>
            <p className="font-medium">{companyName}</p>
          </div>
        )}

        {reason && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <span className="font-medium">เหตุผล:</span> {reason}
            </AlertDescription>
          </Alert>
        )}

        {!reason && (
          <p className="text-sm text-muted-foreground text-center">
            คำขอลงทะเบียนของคุณไม่ผ่านการอนุมัติ
          </p>
        )}

        <div className="text-sm text-muted-foreground text-center space-y-2 mt-6">
          <p>กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง</p>
          <p>หากคุณมีคำถาม กรุณาติดต่อทีมสนับสนุน</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        <Button
          type="button"
          className="w-full"
          onClick={handleBackToDashboard}
        >
          กลับไปหน้าหลัก
        </Button>

        <div className="text-center text-sm">
          <a
            href="mailto:support@chancedee.com"
            className="text-primary hover:underline"
          >
            ติดต่อทีมสนับสนุน
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
