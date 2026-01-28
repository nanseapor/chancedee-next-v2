import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * CAND-R05: Empty State Component
 *
 * Displays when no saved jobs are found
 * Shows CTA to browse jobs
 */

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="mb-6 rounded-full bg-secondary-50 p-6">
        <Bookmark className="h-12 w-12 text-secondary-400" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-medium tracking-wide text-gray-900">
        ยังไม่มีงานที่บันทึก
      </h3>

      {/* Description */}
      <p className="mb-8 max-w-md text-base font-normal tracking-wider leading-relaxed text-gray-600">
        บันทึกงานที่สนใจเพื่อดูภายหลัง
      </p>

      {/* CTA Button */}
      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-900">
        <Link href="/jobs">ค้นหางาน</Link>
      </Button>
    </div>
  );
}
