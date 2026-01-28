import type { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Root layout for company pages
 * This is a minimal layout - the dashboard layout adds the sidebar
 */
export default async function CompanyRootLayout({ children }: LayoutProps) {
  return <>{children}</>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id: companyId } = await params;

  return {
    title: {
      template: '%s | ChanceDee Jobs',
      default: 'บริษัท | ChanceDee Jobs',
    },
    description: `ดูข้อมูลบริษัทและตำแหน่งงานที่เปิดรับ`,
  };
}
