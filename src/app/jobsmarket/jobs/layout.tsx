import { Metadata } from 'next';
import { PublicShell } from '@/components/jobsmarket/shells/PublicShell';

export const metadata: Metadata = {
  title: 'หางาน | ChanceDee',
  description: 'ค้นหางานที่ใช่สำหรับคุณ - ChanceDee แพลตฟอร์มหางานชั้นนำของไทย',
  openGraph: {
    title: 'หางาน | ChanceDee',
    description: 'ค้นหางานที่ใช่สำหรับคุณ',
    type: 'website',
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
