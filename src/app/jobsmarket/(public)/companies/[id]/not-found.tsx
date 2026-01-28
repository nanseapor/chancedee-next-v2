import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 page for company not found
 * Shown when company doesn't exist or is not publicly visible
 */
export default function CompanyNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Building2 size={32} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          ไม่พบบริษัท
        </h1>
        <p className="text-gray-500 mb-6">
          บริษัทที่คุณกำลังค้นหาอาจถูกลบหรือไม่พร้อมใช้งาน
        </p>
        <Button asChild variant="outline">
          <Link href="/jobs">กลับไปค้นหางาน</Link>
        </Button>
      </div>
    </div>
  );
}
