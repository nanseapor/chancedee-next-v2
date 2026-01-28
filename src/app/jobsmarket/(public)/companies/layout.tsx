import { Metadata } from "next";

export const metadata: Metadata = {
  title: "บริษัททั้งหมด | Chancedee Jobs",
  description: "ค้นหาบริษัทชั้นนำที่เปิดรับสมัครงาน - ChanceDee แพลตฟอร์มหางานชั้นนำของไทย",
  openGraph: {
    title: "บริษัททั้งหมด | ChanceDee",
    description: "ค้นพบบริษัทชั้นนำที่เปิดรับสมัครงาน",
    type: "website",
  },
};

/**
 * Companies layout - provides container wrapper for company pages
 * Header/Footer provided by (public)/layout.tsx
 */
export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {children}
    </div>
  );
}
