"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Building2, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { logout } from "@/domains/authentication/services/server/actions/session";
import { saveRolePreference } from "@/hooks/jobsmarket/use-navigation";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";
import { activeRoleAtom } from "@/store/jobsmarket/global-atoms";
import { userAtom } from "@/store/atom-store";

import { RememberCheckbox } from "./RememberCheckbox";
import { RoleCard } from "./RoleCard";

export function SelectRoleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);
  const setActiveRole = useSetAtom(activeRoleAtom);

  const [rememberChoice, setRememberChoice] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Fetch company name - hardcode company ID for now (will be replaced with real user data)
  const { data: companyData } = useSWR(
    user ? ["company-info", "default"] : null,
    () => webCompanyInformationGetById("default"),
    {
      revalidateOnFocus: false,
      fallbackData: null,
      onError: () => {
        // Silently fail and use fallback
      },
    }
  );

  // Simple auth check
  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, router]);

  const handleRoleSelect = async (role: "candidate" | "company") => {
    // Prevent double-clicks
    if (isRedirecting || !user) return;
    setIsRedirecting(true);

    // Update global state
    setActiveRole(role);

    // Persist if checkbox checked
    if (rememberChoice) {
      saveRolePreference(role, true);
    }

    // Determine destination
    const redirectUrl = searchParams.get("redirect");
    let destination: string;

    if (redirectUrl && isValidRedirect(redirectUrl, role)) {
      destination = redirectUrl;
    } else {
      destination =
        role === "candidate"
          ? `/candidates/${user.uid}`
          : `/companies/default/dashboard`;
    }

    // Navigate (replace history)
    router.replace(destination);
  };

  const handleLogout = async () => {
    // Clear localStorage preference
    localStorage.removeItem("lastActiveRole");

    // Call logout server action
    await logout();

    // Redirect to login
    router.replace("/auth/login");
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          ChanceDee
        </Link>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-semibold text-gray-900">
          เลือกบทบาทที่ต้องการใช้งาน
        </h1>
        <p className="text-sm text-gray-500 mt-1">Select your role</p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <RoleCard
          role="candidate"
          title="ผู้หางาน"
          subtitle="Candidate"
          icon={<User className="w-12 h-12 text-primary" />}
          features={[
            "ค้นหาและสมัครงาน",
            "ติดตามใบสมัคร",
            "แชทกับนายจ้าง",
          ]}
          onSelect={() => handleRoleSelect("candidate")}
          disabled={isRedirecting}
        />

        <RoleCard
          role="company"
          title={companyData?.companyName || "นายจ้าง"}
          subtitle="Employer"
          icon={<Building2 className="w-12 h-12 text-primary" />}
          features={[
            "ลงประกาศรับสมัครงาน",
            "ดูและจัดการผู้สมัคร",
            "แชทกับผู้สมัคร",
          ]}
          onSelect={() => handleRoleSelect("company")}
          disabled={isRedirecting}
        />
      </div>

      {/* Remember Checkbox */}
      <RememberCheckbox checked={rememberChoice} onChange={setRememberChoice} />

      {/* Logout Link */}
      <div className="mt-8 text-center">
        <Button
          variant="link"
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ต้องการเปลี่ยนบัญชี?{" "}
          <span className="text-primary ml-1">ออกจากระบบ</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Validate redirect URL is safe and role-appropriate
 * Per RIS §9.1
 */
function isValidRedirect(url: string, role: "candidate" | "company"): boolean {
  // Must be internal URL
  if (!url.startsWith("/")) return false;

  // Role-appropriate paths (clean paths without /jobsmarket prefix)
  if (role === "candidate") {
    return /^\/(candidates\/|jobs\/|chat|notifications)/.test(url);
  }

  if (role === "company") {
    return /^\/(companies\/|chat|notifications)/.test(url);
  }

  return false;
}
