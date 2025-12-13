/**
 * Company Mode Select Component
 * Per AUTH-R02 Implementation Plan Section 3.1
 * Per RIS AUTH-R02 §6.2 - Company flow step 1
 *
 * Choose between Mode A (Create New Company) or Mode B (Join Existing)
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, UserPlus } from "lucide-react";

export interface CompanyModeSelectProps {
  /** Callback when mode is selected */
  onSelectMode: (mode: "new" | "join") => void;
  /** Optional class name */
  className?: string;
}

/**
 * Company Mode Selection
 * Shows two cards: Create New or Join Existing
 */
export function CompanyModeSelect({
  onSelectMode,
  className = "",
}: CompanyModeSelectProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">สมัครสมาชิกบริษัท</h2>
        <p className="text-gray-600">เลือกประเภทการลงทะเบียน</p>
      </div>

      {/* Mode Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Mode A: Create New Company */}
        <Card
          className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
          onClick={() => onSelectMode("new")}
        >
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="rounded-full bg-purple-100 p-4">
              <Building2 className="h-12 w-12 text-purple-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">สร้างบริษัทใหม่</h3>
              <p className="text-sm text-gray-600">
                ลงทะเบียนบริษัทของคุณเพื่อเริ่มประกาศรับสมัครงาน
              </p>
            </div>
            <Button className="w-full">สร้างบริษัทใหม่</Button>
          </CardContent>
        </Card>

        {/* Mode B: Join Existing Company */}
        <Card
          className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
          onClick={() => onSelectMode("join")}
        >
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="rounded-full bg-blue-100 p-4">
              <UserPlus className="h-12 w-12 text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">เข้าร่วมบริษัทที่มีอยู่</h3>
              <p className="text-sm text-gray-600">
                ส่งคำขอเข้าร่วมบริษัทที่ลงทะเบียนไว้แล้ว
              </p>
            </div>
            <Button className="w-full" variant="outline">
              เข้าร่วมบริษัท
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">หมายเหตุ:</span>{" "}
          หากคุณเป็นเจ้าของหรือผู้ก่อตั้งบริษัท เลือก &ldquo;สร้างบริษัทใหม่&rdquo;
          หากคุณเป็นพนักงาน HR หรือผู้ดูแลที่ต้องการเข้าร่วมบริษัทที่มีอยู่ เลือก &ldquo;เข้าร่วมบริษัท&rdquo;
        </p>
      </div>

      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => window.history.back()}
      >
        ← ย้อนกลับ
      </Button>
    </div>
  );
}
