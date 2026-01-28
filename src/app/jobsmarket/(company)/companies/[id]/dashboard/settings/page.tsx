/**
 * COMP-R03: Company Settings Page
 *
 * Server component wrapper for settings page
 * Supports 2 tabs: Profile, Config
 */

import { SettingsClient } from "./_components/SettingsClient";

// ============================================
// Types
// ============================================

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

// ============================================
// Page Component
// ============================================

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { id: companyId } = await params;

  return (
    <div className="container mx-auto px-4 py-6">
      <SettingsClient companyId={companyId} />
    </div>
  );
}
