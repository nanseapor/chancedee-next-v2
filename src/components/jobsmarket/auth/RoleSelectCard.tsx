/**
 * Role Select Card Component
 * Per AUTH-R02 Implementation Plan Section 3.1 (Page Components)
 * Per RIS AUTH-R02 §6.1 - Initial state: role_select
 *
 * First step: User selects candidate or company role
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, UserCircle } from "lucide-react";

export interface RoleSelectCardProps {
  /** Callback when role is selected */
  onSelectRole: (role: "candidate" | "company") => void;
  /** Optional class name */
  className?: string;
}

/**
 * Role Selection Card
 * Shows two cards: Candidate and Company
 */
export function RoleSelectCard({
  onSelectRole,
  className = "",
}: RoleSelectCardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">สมัครสมาชิก</h1>
        <p className="text-gray-600">เลือกประเภทบัญชีที่คุณต้องการสร้าง</p>
      </div>

      {/* Role Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Candidate Card */}
        <Card
          className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
          onClick={() => onSelectRole("candidate")}
        >
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="rounded-full bg-blue-100 p-4">
              <UserCircle className="h-12 w-12 text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">ผู้หางาน</h2>
              <p className="text-sm text-gray-600">
                สร้างโปรไฟล์ ค้นหางาน และสมัครตำแหน่งที่คุณสนใจ
              </p>
            </div>
            <Button className="w-full">เลือกผู้หางาน</Button>
          </CardContent>
        </Card>

        {/* Company Card */}
        <Card
          className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
          onClick={() => onSelectRole("company")}
        >
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="rounded-full bg-purple-100 p-4">
              <Briefcase className="h-12 w-12 text-purple-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">บริษัท</h2>
              <p className="text-sm text-gray-600">
                ประกาศตำแหน่งงาน และหาผู้สมัครที่เหมาะสม
              </p>
            </div>
            <Button className="w-full">เลือกบริษัท</Button>
          </CardContent>
        </Card>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        มีบัญชีอยู่แล้ว?{" "}
        <a href="/auth/login" className="text-primary hover:underline font-medium">
          เข้าสู่ระบบ
        </a>
      </p>
    </div>
  );
}
