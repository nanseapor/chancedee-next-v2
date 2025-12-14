import { Metadata } from "next";
import { SettingsClient } from "./_components/SettingsClient";

export const metadata: Metadata = {
  title: "ตั้งค่าบัญชี | ChanceDee Jobs",
  description: "จัดการตั้งค่าบัญชีของคุณ",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
