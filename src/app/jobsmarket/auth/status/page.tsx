import type { Metadata } from "next";
import { StatusClient } from "./_components/StatusClient";

/**
 * AUTH-R05: Status Page
 * Route: /jobsmarket/auth/status
 *
 * Display user account status based on roles:
 * - deleted: Account permanently deleted
 * - staff-pending: Waiting for company approval
 * - company-pending: Waiting for platform approval
 * - rejected: Company registration rejected (query param only)
 *
 * Per AUTH-R05 RIS §3-8
 */

export const metadata: Metadata = {
  title: "สถานะบัญชี | ChanceDee Jobs",
  description: "ตรวจสอบสถานะบัญชีของคุณ",
};

export default function StatusPage() {
  return <StatusClient />;
}
