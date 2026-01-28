import { Metadata } from 'next';
import PendingClient from './_components/PendingClient';

export const metadata: Metadata = {
  title: 'รอการอนุมัติ | ChanceDee',
  description: 'บริษัทของคุณอยู่ระหว่างการตรวจสอบ',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PendingPage({ params }: Props) {
  const { id } = await params;
  return <PendingClient companyId={id} />;
}
