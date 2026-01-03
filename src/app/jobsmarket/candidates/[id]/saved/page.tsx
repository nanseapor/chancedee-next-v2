import { Metadata } from 'next';
import SavedClient from './_components/SavedClient';

/**
 * CAND-R05: Saved Items Page
 *
 * Route: /jobsmarket/candidates/[id]/saved
 * Shows saved jobs, searches, and job alerts
 */

export const metadata: Metadata = {
  title: 'รายการที่บันทึก | Chancedee Jobs',
  description: 'ดูงานที่บันทึก การค้นหาที่บันทึก และการแจ้งเตือนงาน',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SavedPage(props: PageProps) {
  const params = await props.params;
  const { id: candidateId } = params;

  return <SavedClient candidateId={candidateId} />;
}
