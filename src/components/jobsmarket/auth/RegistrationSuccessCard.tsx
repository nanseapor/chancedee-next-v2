/**
 * Registration Success Card Component
 * Per AUTH-R02 Implementation Plan Section 3.1
 * Per RIS AUTH-R02 §6.1 and §6.2 - Success states
 *
 * Shows success message and next steps based on role
 */

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

export interface RegistrationSuccessCardProps {
  /** User role */
  role: "candidate" | "company";
  /** Company mode (for company role only) */
  mode?: "new" | "join";
  /** User UID for redirect */
  uid?: string;
  /** Optional class name */
  className?: string;
}

/**
 * Registration Success Card
 * Different messages for candidate vs company flows
 */
export function RegistrationSuccessCard({
  role,
  mode,
  uid,
  className = "",
}: RegistrationSuccessCardProps) {
  const router = useRouter();

  const handleContinue = () => {
    if (role === "candidate" && uid) {
      // Candidate: Redirect to profile with onboarding tab
      router.push(`/jobsmarket/candidates/${uid}?tab=onboarding`);
    } else if (role === "company") {
      // Company: Stay on page (per Section 15 deviation from BLS-01)
      // Success card is already shown
    }
  };

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardContent className="flex flex-col items-center gap-6 p-8">
        {/* Success Icon */}
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>

        {/* Success Message - Candidate */}
        {role === "candidate" && (
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-green-800">
              สมัครสมาชิกสำเร็จ!
            </h2>
            <p className="text-gray-700">
              ยินดีต้อนรับสู่ Chancedee Jobs! คุณได้รับ{" "}
              <span className="font-semibold text-yellow-600">100 เหรียญ</span>{" "}
              สำหรับการสมัครสมาชิก
            </p>
            <p className="text-sm text-gray-600">
              เริ่มต้นสร้างโปรไฟล์ของคุณเพื่อค้นหางานที่เหมาะสม
            </p>
          </div>
        )}

        {/* Success Message - Company Mode A (Create New) */}
        {role === "company" && mode === "new" && (
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-green-800">
              ส่งคำขอสมัครสมาชิกเรียบร้อย!
            </h2>
            <p className="text-gray-700">
              คำขอสร้างบริษัทของคุณได้ถูกส่งไปยังทีมงานแล้ว
            </p>
            <div className="bg-white rounded-lg p-4 space-y-2 text-sm text-left">
              <p className="font-semibold text-gray-800">ขั้นตอนต่อไป:</p>
              <ul className="space-y-1 text-gray-600 list-disc list-inside">
                <li>ทีมงานจะตรวจสอบเอกสารภายใน 1-3 วันทำการ</li>
                <li>คุณจะได้รับอีเมลแจ้งผลการอนุมัติ</li>
                <li>เมื่อได้รับอนุมัติ คุณสามารถเข้าสู่ระบบและเริ่มประกาศรับสมัครงานได้</li>
              </ul>
            </div>
          </div>
        )}

        {/* Success Message - Company Mode B (Join Existing) */}
        {role === "company" && mode === "join" && (
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-green-800">
              ส่งคำขอเข้าร่วมบริษัทเรียบร้อย!
            </h2>
            <p className="text-gray-700">
              คำขอเข้าร่วมบริษัทของคุณได้ถูกส่งไปยังผู้ดูแลระบบแล้ว
            </p>
            <div className="bg-white rounded-lg p-4 space-y-2 text-sm text-left">
              <p className="font-semibold text-gray-800">ขั้นตอนต่อไป:</p>
              <ul className="space-y-1 text-gray-600 list-disc list-inside">
                <li>ผู้ดูแลบริษัทจะตรวจสอบนามบัตรและข้อมูลของคุณ</li>
                <li>คุณจะได้รับอีเมลแจ้งผลการอนุมัติ</li>
                <li>เมื่อได้รับอนุมัติ คุณสามารถเข้าถึงฟีเจอร์บริษัทได้</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ในระหว่างนี้ คุณยังคงสามารถใช้งานในฐานะผู้หางานได้ตามปกติ
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {role === "candidate" && (
            <Button onClick={handleContinue} className="w-full" size="lg">
              เริ่มสร้างโปรไฟล์
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {role === "company" && mode === "new" && (
            <Button
              variant="outline"
              onClick={() => router.push("/jobsmarket")}
              className="w-full"
            >
              กลับหน้าหลัก
            </Button>
          )}

          {role === "company" && mode === "join" && (
            <>
              <Button
                onClick={() => router.push("/jobsmarket/jobs")}
                className="w-full"
                size="lg"
              >
                เรียกดูตำแหน่งงาน
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/jobsmarket")}
                className="w-full"
              >
                กลับหน้าหลัก
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
