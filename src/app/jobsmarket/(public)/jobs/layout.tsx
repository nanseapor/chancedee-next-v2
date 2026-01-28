import { Metadata } from "next";

export const metadata: Metadata = {
  title: "หางาน | ChanceDee",
  description: "ค้นหางานที่ใช่สำหรับคุณ - ChanceDee แพลตฟอร์มหางานชั้นนำของไทย",
  openGraph: {
    title: "หางาน | ChanceDee",
    description: "ค้นหางานที่ใช่สำหรับคุณ",
    type: "website",
  },
};

/**
 * Jobs layout - provides container wrapper for job pages
 * Header/Footer provided by (public)/layout.tsx
 */
export default function JobsLayout({
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
