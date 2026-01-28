"use client";

import { useFirebaseAuth } from "@/hooks/use-auth";
import ChangePasswordForm from "@/components/auth/change-password";
import CreatePasswordForm from "@/components/auth/create-password";

export function PasswordTab() {
  const { user: firebaseUser } = useFirebaseAuth();

  // Detect if user has password provider
  const hasPasswordProvider = firebaseUser?.providerData?.some(
    (provider) => provider?.providerId === "password"
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {hasPasswordProvider ? "เปลี่ยนรหัสผ่าน" : "สร้างรหัสผ่าน"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasPasswordProvider ? "Change Password" : "Create Password"}
        </p>
      </div>

      {hasPasswordProvider ? <ChangePasswordForm /> : <CreatePasswordForm />}
    </div>
  );
}
