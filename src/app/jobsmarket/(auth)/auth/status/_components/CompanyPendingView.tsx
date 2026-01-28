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

interface CompanyPendingViewProps {
  targetCompanyId: string | null;
}

/**
 * CompanyPendingView - Shows when company admin is waiting for platform approval
 * Per AUTH-R05 RIS §5.3 (COMPANY-PENDING state)
 *
 * Features:
 * - Shows company name from Firestore
 * - 5-step progress indicator (step 1 = waiting for Chancedee)
 * - Display only (no actions in v1.0)
 */
export function CompanyPendingView({
  targetCompanyId,
}: CompanyPendingViewProps) {
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

  const companyName = company?.companyName || "บริษัทของคุณ";

  // Company onboarding flow: 5 steps
  // Per AUTH-R05 RIS §5.3
  const steps = [
    {
      label: "ลงทะเบียนสำเร็จ",
      description: "ส่งข้อมูลบริษัทเรียบร้อยแล้ว",
    },
    {
      label: "รอการตรวจสอบจาก ChanceDee",
      description: "ทีมงานกำลังตรวจสอบเอกสารของคุณ",
    },
    {
      label: "ยืนยันเอกสาร",
      description: "เอกสารผ่านการตรวจสอบแล้ว",
    },
    {
      label: "ลงนามสัญญา",
      description: "ลงนามสัญญานายจ้าง",
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
        <CardTitle className="text-2xl">กำลังตรวจสอบข้อมูล</CardTitle>
        <CardDescription className="text-center">
          Under Review
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Company name */}
        <div className="text-center pb-4 border-b">
          <p className="text-sm text-muted-foreground">บริษัท</p>
          <p className="font-semibold text-lg mt-1">{companyName}</p>
        </div>

        {/* Progress stepper - currentStep=1 means "waiting for ChanceDee" is active */}
        <ProgressStepper steps={steps} currentStep={1} />

        {/* Information message */}
        <div className="text-sm text-muted-foreground text-center space-y-2 pt-4 border-t">
          <p>
            ทีม ChanceDee จะตรวจสอบข้อมูลบริษัทของคุณ
            <br />
            และติดต่อกลับภายใน 3-5 วันทำการ
          </p>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium">
              📋 กรุณาเตรียมเอกสารต่อไปนี้ให้พร้อม:
            </p>
            <ul className="text-xs mt-2 space-y-1 text-left">
              <li>• หนังสือรับรองบริษัท</li>
              <li>• ภ.พ.20 (ไม่เกิน 6 เดือน)</li>
              <li>• สำเนาบัตรประชาชนผู้มีอำนาจลงนาม</li>
            </ul>
          </div>
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
