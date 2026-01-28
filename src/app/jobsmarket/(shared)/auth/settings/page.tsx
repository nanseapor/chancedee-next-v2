import { Metadata } from "next";
import { SettingsClient } from "./_components/SettingsClient";

export const metadata: Metadata = {
  title: "ตั้งค่าบัญชี | ChanceDee Jobs",
  description: "จัดการตั้งค่าบัญชีของคุณ",
};

/**
 * Account Settings Page
 *
 * Authenticated page for users to manage their account settings.
 * Shell provided by (shared)/layout.tsx
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      <SettingsClient />
    </div>
  );
}
