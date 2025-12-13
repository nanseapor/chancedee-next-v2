"use client";

import { Clock } from "lucide-react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressStepper } from "./ProgressStepper";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";

interface StaffPendingViewProps {
  targetCompanyId: string | null;
}

/**
 * StaffPendingView - Shows when staff is waiting for company approval
 * Per AUTH-R05 RIS §5.2 (STAFF-PENDING state)
 *
 * Features:
 * - Shows company name from Firestore
 * - 3-step progress indicator (step 1 = waiting for company)
 * - Display only (no cancel option in v1.0 per RIS §13)
 */
export function StaffPendingView({ targetCompanyId }: StaffPendingViewProps) {
  // Fetch company data using Server Action (NOT API route)
  // Per CLAUDE.md - Use webCompanyInformationGetById from src/lib/database/actions/company-information.ts
  const { data: company } = useSWR(
    targetCompanyId ? ["company-info", targetCompanyId] : null,
    ([, id]) => webCompanyInformationGetById(id),
    {
      onError: () => {}, // Silent fallback if company fetch fails
      revalidateOnFocus: false,
    }
  );

  const companyName = company?.companyName || "บริษัท";

  // Staff onboarding flow: 3 steps
  // Per AUTH-R05 RIS §5.2
  const steps = [
    {
      label: "ลงทะเบียนสำเร็จ",
      description: "คุณได้สร้างบัญชีเรียบร้อยแล้ว",
    },
    {
      label: "รอการอนุมัติจากบริษัท",
      description: `${companyName} กำลังตรวจสอบข้อมูลของคุณ`,
    },
    {
      label: "เสร็จสมบูรณ์",
      description: "เริ่มใช้งานระบบได้ทันที",
    },
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">รอการอนุมัติ</CardTitle>
        <CardDescription className="text-center">
          Waiting for Approval
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Company name */}
        <div className="text-center pb-4 border-b">
          <p className="text-sm text-muted-foreground">คุณได้สมัครเข้าร่วม</p>
          <p className="font-semibold text-lg mt-1">{companyName}</p>
        </div>

        {/* Progress stepper - currentStep=1 means "waiting for company" is active */}
        <ProgressStepper steps={steps} currentStep={1} />

        {/* Information message */}
        <div className="text-sm text-muted-foreground text-center space-y-2 pt-4 border-t">
          <p>
            บริษัทจะตรวจสอบข้อมูลของคุณ
            <br />
            และอนุมัติการเข้าร่วมภายใน 1-3 วันทำการ
          </p>
          <p className="text-xs mt-4">
            หากมีคำถาม กรุณาติดต่อ{" "}
            <a
              href="mailto:support@chancedee.com"
              className="text-primary hover:underline"
            >
              support@chancedee.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
