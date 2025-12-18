import { Metadata } from "next";
import { SettingsClient } from "./_components/SettingsClient";

export const metadata: Metadata = {
  title: "การตั้งค่า | ChanceDee Jobs",
  description: "จัดการการตั้งค่าโปรไฟล์และการแจ้งเตือน",
};

interface SettingsPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * CAND-R03: Candidate Settings Page
 *
 * Server component that passes the candidate ID to SettingsClient.
 * Auth and ownership validation handled client-side (following AUTH-R06 pattern).
 */
export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return <SettingsClient candidateId={id} />;
}
