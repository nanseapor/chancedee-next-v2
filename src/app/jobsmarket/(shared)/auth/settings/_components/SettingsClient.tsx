"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

export type TabId = "account" | "password" | "notifications" | "privacy" | "delete";

export function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();
  const hasCheckedAuth = useRef(false);

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

  // Redirect to login only after auth check is complete and confirmed no user
  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading) return;

    // Only redirect once, and only if we're sure there's no user
    if (!hasCheckedAuth.current && !firebaseUser) {
      hasCheckedAuth.current = true;
      // Add a small delay to ensure session cookie validation has completed
      const timer = setTimeout(() => {
        if (!firebaseUser) {
          router.push("/auth/login?redirect=/auth/settings");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [authLoading, firebaseUser, router]);

  // Handle tab change
  function handleTabChange(newTab: TabId) {
    setActiveTab(newTab);
    router.replace(`/auth/settings?tab=${newTab}`);
  }

  // Show loading skeleton while checking auth
  if (authLoading || !firebaseUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine tab visibility
  const isPending = activeRole === "pending";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
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
