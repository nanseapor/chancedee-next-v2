import Link from 'next/link';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-lg font-bold text-primary">ChanceDee</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              แพลตฟอร์มหางานชั้นนำของไทย
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-semibold text-sm mb-3">สำหรับผู้หางาน</h3>
            <ul className="space-y-2">
              <FooterLink href="/jobsmarket/jobs">ค้นหางาน</FooterLink>
              <FooterLink href="/jobsmarket/companies">ดูบริษัท</FooterLink>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-sm mb-3">สำหรับผู้ประกอบการ</h3>
            <ul className="space-y-2">
              <FooterLink href="/jobsmarket/auth/register?role=company">ลงประกาศงาน</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">ข้อมูลเพิ่มเติม</h3>
            <ul className="space-y-2">
              <FooterLink href="/jobsmarket/legal/terms">ข้อกำหนดการใช้งาน</FooterLink>
              <FooterLink href="/jobsmarket/privacy">นโยบายความเป็นส่วนตัว</FooterLink>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ChanceDee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
