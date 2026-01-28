import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export const metadata = {
  title: "ไม่มีสิทธิ์เข้าถึง | ChanceDee Jobs",
};

/**
 * 403 Forbidden Page
 *
 * Displayed when a user tries to access a resource they don't have permission to view.
 * Examples:
 * - Trying to view another user's candidate profile
 * - Trying to access a company dashboard without being a member
 * - Trying to access admin routes without admin role
 */
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <ShieldX className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          ไม่มีสิทธิ์เข้าถึง
        </h1>
        <p className="text-gray-600 mb-6">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาตรวจสอบว่าคุณเข้าสู่ระบบด้วยบัญชีที่ถูกต้อง
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/auth/login">เข้าสู่ระบบ</Link>
          </Button>
          <Button asChild>
            <Link href="/">กลับหน้าหลัก</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
