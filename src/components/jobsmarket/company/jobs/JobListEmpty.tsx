import { Briefcase, Search } from "lucide-react";
import Link from "next/link";

interface JobListEmptyProps {
  reason: "no-jobs" | "filtered";
  companyId: string;
}

export function JobListEmpty({ reason, companyId }: JobListEmptyProps) {
  if (reason === "no-jobs") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Briefcase className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          ยังไม่มีประกาศงาน
        </h3>
        <p className="mb-6 text-gray-600">
          เริ่มต้นสร้างประกาศงานแรกของคุณ
        </p>
        <Link
          href={`/companies/${companyId}/jobs/create`}
          className="rounded-[0.625rem] bg-primary px-6 py-3 font-medium tracking-widest text-primary-foreground hover:bg-primary-900"
        >
          ลงประกาศงานแรก
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Search className="mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        ไม่มีงานในสถานะนี้
      </h3>
      <p className="text-gray-600">ลองค้นหาด้วยคำค้นหาอื่น</p>
    </div>
  );
}
