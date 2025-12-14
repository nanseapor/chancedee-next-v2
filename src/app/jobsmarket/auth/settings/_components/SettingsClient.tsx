"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { webUserDataPropsGetById } from "@/lib/database/actions/user-data-props";
import { SettingsTabs } from "./SettingsTabs";
import { AccountTab } from "./AccountTab";
import { PasswordTab } from "./PasswordTab";
import { NotificationsTab } from "./NotificationsTab";
import { PrivacyTab } from "./PrivacyTab";
import { DeleteAccountTab } from "./DeleteAccountTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TabId = "account" | "password" | "notifications" | "privacy" | "delete";

export function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();

  // Fetch user data using Server Action
  const { data: userData, isLoading: userDataLoading } = useSWR(
    firebaseUser?.uid ? ["user-data", firebaseUser.uid] : null,
    ([, uid]) => webUserDataPropsGetById(uid),
    {
      revalidateOnFocus: false,
    }
  );

  // Determine active role from user data
  const activeRole = useMemo(() => {
    if (!userData?.info?.roles) return null;
    const roles = userData.info.roles;
    if (roles.includes("pending")) return "pending";
    if (roles.includes("company")) return "company";
    if (roles.includes("candidate")) return "candidate";
    return null;
  }, [userData]);

  // Get tab from URL or default to 'account'
  const tabFromUrl = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || "account");

  // Sync activeTab with URL changes on mount
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authLoading || userDataLoading) return;

    if (!firebaseUser) {
      router.push("/jobsmarket/auth/login");
    }
  }, [authLoading, userDataLoading, firebaseUser, router]);

  // Handle tab change
  function handleTabChange(newTab: TabId) {
    setActiveTab(newTab);
    router.replace(`/jobsmarket/auth/settings?tab=${newTab}`);
  }

  // Show loading while checking auth
  if (authLoading || userDataLoading || !firebaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  // Determine tab visibility
  const isPending = activeRole === "pending";

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            ตั้งค่าบัญชี
          </CardTitle>
          <p className="text-muted-foreground">
            Account Settings
          </p>
        </CardHeader>
        <CardContent>
          <SettingsTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isPending={isPending}
          />

          <div className="mt-6">
            {activeTab === "account" && <AccountTab />}
            {activeTab === "password" && <PasswordTab />}
            {activeTab === "notifications" && !isPending && <NotificationsTab />}
            {activeTab === "privacy" && <PrivacyTab />}
            {activeTab === "delete" && <DeleteAccountTab />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
