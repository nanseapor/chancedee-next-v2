"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import useSubscription from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast-notification";
import { getFirebaseAuth } from "@/lib/firebase";
import type { userDataProps } from "@/types/auth.types";
import { Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import ChangePasswordForm from "./change-password";
import CreatePasswordForm from "./create-password";

const PasswordSettings = ({ userContext }: { userContext: userDataProps }) => {
  const { addToast } = useToast();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const [subscriptionToggle, setSubscriptionToggle] = useState<boolean>();
  const currentUser = getFirebaseAuth().currentUser;
  const userType = useMemo(() => {
    return currentUser?.providerData;
  }, [currentUser]);

  useEffect(() => {
    if (
      !isSubscriptionLoading &&
      subscription &&
      subscription.find((sub) => sub.email === userContext?.email)
    ) {
      setSubscriptionToggle(true);
    } else {
      setSubscriptionToggle(false);
    }
  }, [subscription, isSubscriptionLoading]);

  const handleToggle = (checked: boolean) => {
    // ... (handleToggle function remains unchanged)
  };

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>การรับข่าวสาร</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 rounded-lg border p-4 shadow-sm">
              <Switch
                id="subscription-toggle"
                checked={isSubscriptionLoading ? false : subscriptionToggle}
                onCheckedChange={handleToggle}
                disabled={isSubscriptionLoading}
              />
              <Label
                htmlFor="subscription-toggle"
                className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>สมัครบริการแจ้งข่าวสารทางอีเมล</span>
              </Label>
              <span className="text-sm text-muted-foreground">
                {userContext?.email}
              </span>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>
              {userType?.find((user) => user.providerId === "password")
                ? "เปลี่ยนรหัสผ่าน"
                : "ตั้งรหัสผ่านสำหรับการเข้าระบบด้วย Email"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userType?.find((user) => user.providerId === "password") ? (
              <ChangePasswordForm />
            ) : (
              <CreatePasswordForm />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordSettings;
