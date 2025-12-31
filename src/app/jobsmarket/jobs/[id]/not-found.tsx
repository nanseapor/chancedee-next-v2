import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';

/**
 * 404 Not Found page for job detail route
 *
 * Triggered when:
 * - Job ID doesn't exist
 * - Job is unpublished/closed
 * - Job is inactive
 */
export default function JobNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-secondary-100 flex items-center justify-center">
            <Search className="w-12 h-12 text-secondary-600" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-wide">
            ไม่พบตำแหน่งงานนี้
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            ตำแหน่งงานที่คุณกำลังมองหาอาจถูกปิดรับสมัครแล้ว
            หรือไม่มีอยู่ในระบบ
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            asChild
            className="inline-flex items-center gap-2"
          >
            <Link href="/jobsmarket/jobs">
              <ArrowLeft size={16} />
              กลับไปหน้าหางาน
            </Link>
          </Button>

          <Button
            asChild
            className="inline-flex items-center gap-2"
          >
            <Link href="/jobsmarket/jobs">
              <Search size={16} />
              ค้นหางานอื่น
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            หากคุณคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อ{' '}
            <Link
              href="/jobsmarket/support"
              className="text-secondary-700 hover:underline"
            >
              ฝ่ายสนับสนุน
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
