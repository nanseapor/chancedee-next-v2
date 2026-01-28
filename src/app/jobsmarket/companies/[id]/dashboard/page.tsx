import { Metadata } from 'next';
import DashboardClient from './_components/DashboardClient';

export const metadata: Metadata = {
  title: 'แดชบอร์ด | ChanceDee',
  description: 'แดชบอร์ดบริษัท - ดูภาพรวมงานและใบสมัคร',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { id } = await params;
  return <DashboardClient companyId={id} />;
}
