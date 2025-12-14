"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { webUserDataPropsGetById } from "@/lib/database/actions/user-data-props";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

export function AccountTab() {
  const { user: firebaseUser } = useFirebaseAuth();

  // Fetch user data
  const { data: userData } = useSWR(
    firebaseUser?.uid ? ["user-data", firebaseUser.uid] : null,
    ([, uid]) => webUserDataPropsGetById(uid)
  );

  // Determine active role from user data
  const activeRole = useMemo(() => {
    if (!userData?.info?.roles) return null;
    const roles = userData.info.roles;
    if (roles.includes("company")) return "company";
    if (roles.includes("candidate")) return "candidate";
    return null;
  }, [userData]);

  // Default role preference state
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(false);
  const [defaultRole, setDefaultRole] = useState<"candidate" | "company">("candidate");

  // Load saved preference on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("lastActiveRole");
    if (savedRole === "candidate" || savedRole === "company") {
      setAutoSkipEnabled(true);
      setDefaultRole(savedRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if user has multiple roles
  const isMultiRole = userData?.info?.roles?.includes("candidate") && userData?.info?.roles?.includes("company");

  // Get email verification status
  const isEmailVerified = firebaseUser?.emailVerified || false;

  // Get connected providers
  const providers = firebaseUser?.providerData || [];
  const hasPasswordProvider = providers.some(p => p?.providerId === "password");
  const hasGoogleProvider = providers.some(p => p?.providerId === "google.com");
  const hasFacebookProvider = providers.some(p => p?.providerId === "facebook.com");

  // Handle auto-skip toggle
  function handleAutoSkipToggle(checked: boolean) {
    setAutoSkipEnabled(checked);
    if (!checked) {
      localStorage.removeItem("lastActiveRole");
    } else {
      // Set to current active role or default to candidate
      const roleToSave = (activeRole === "candidate" || activeRole === "company") ? activeRole : "candidate";
      localStorage.setItem("lastActiveRole", roleToSave);
      setDefaultRole(roleToSave);
    }
  }

  // Handle default role change
  function handleDefaultRoleChange(role: "candidate" | "company") {
    setDefaultRole(role);
    localStorage.setItem("lastActiveRole", role);
  }

  // Get company name for display
  // TODO: Fetch company name from company_information collection using userData?.info?.companyId
  const companyName = "บริษัทของคุณ";

  return (
    <div className="space-y-6">
      {/* Email Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">อีเมล</h3>
        <p className="text-sm text-muted-foreground">Email</p>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-base">{firebaseUser?.email}</span>
            {providers.length > 0 && providers[0] && (
              <Badge variant="secondary">
                {providers[0].providerId === "google.com" && "Google"}
                {providers[0].providerId === "facebook.com" && "Facebook"}
                {providers[0].providerId === "password" && "อีเมล"}
              </Badge>
            )}
          </div>
        </Card>

        {isEmailVerified && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>ยืนยันอีเมลแล้ว</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Connected Providers Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">ผู้ให้บริการที่เชื่อมต่อ</h3>
        <p className="text-sm text-muted-foreground">Connected Providers</p>

        <Card className="divide-y">
          {/* Google */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                G
              </div>
              <span>Google</span>
            </div>
            <Badge variant={hasGoogleProvider ? "default" : "outline"}>
              {hasGoogleProvider ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
            </Badge>
          </div>

          {/* Facebook */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                f
              </div>
              <span>Facebook</span>
            </div>
            <Badge variant={hasFacebookProvider ? "default" : "outline"}>
              {hasFacebookProvider ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
            </Badge>
          </div>

          {/* Email/Password */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                ✉
              </div>
              <span>อีเมล/รหัสผ่าน</span>
            </div>
            <Badge variant={hasPasswordProvider ? "default" : "outline"}>
              {hasPasswordProvider ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Default Role Section - Only for multi-role users */}
      {isMultiRole && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">บทบาทเริ่มต้นเมื่อเข้าสู่ระบบ</h3>
              <p className="text-sm text-muted-foreground">Default Role on Login</p>
            </div>

            <Card className="p-4 space-y-4">
              {/* Auto-skip checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="auto-skip"
                  checked={autoSkipEnabled}
                  onCheckedChange={handleAutoSkipToggle}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="auto-skip"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    ข้ามหน้าเลือกบทบาท
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Skip role selection page
                  </p>
                </div>
              </div>

              {/* Role dropdown - Only shown when auto-skip is enabled */}
              {autoSkipEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="default-role" className="text-sm">
                    บทบาทที่เลือกไว้
                  </Label>
                  <Select value={defaultRole} onValueChange={handleDefaultRoleChange}>
                    <SelectTrigger id="default-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">ผู้หางาน</SelectItem>
                      <SelectItem value="company">นายจ้าง ({companyName})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>

            <p className="text-sm text-muted-foreground">
              เมื่อยกเลิกเลือก จะแสดงหน้าเลือกบทบาททุกครั้งที่เข้าสู่ระบบ
            </p>
            <p className="text-xs text-muted-foreground">
              When unchecked, the role selection page will be shown on every login
            </p>
          </div>
        </>
      )}
    </div>
  );
}
