import { redirect } from "next/navigation";

/**
 * Platform Admin Index Page
 * Per ADM-R00 Cross-Cutting RIS
 *
 * Redirects to the default admin page (companies list)
 */

export default function PlatformPage() {
  redirect("/platform/companies");
}
