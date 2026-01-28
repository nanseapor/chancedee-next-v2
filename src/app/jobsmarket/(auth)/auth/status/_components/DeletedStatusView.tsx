"use client";

import { XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * DeletedStatusView - Shows when user account is permanently deleted
 * Per AUTH-R05 RIS §5.1 (DELETED state)
 *
 * Features:
 * - Display only (no recovery option in v1.0)
 * - Clear messaging that deletion is permanent
 * - No action buttons (per RIS §13 - account recovery deferred to future)
 */
export function DeletedStatusView() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <CardTitle className="text-2xl">บัญชีถูกลบแล้ว</CardTitle>
        <CardDescription className="text-center">
          Account Deleted
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          บัญชีของคุณถูกลบออกจากระบบแล้ว
        </p>
        <p className="text-sm text-muted-foreground">
          การลบบัญชีเป็นการดำเนินการที่ไม่สามารถย้อนกลับได้
        </p>

        {/* Contact support section */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            หากคุณมีคำถามเพิ่มเติม กรุณาติดต่อ
          </p>
          <a
            href="mailto:support@chancedee.com"
            className="text-sm text-primary hover:underline"
          >
            support@chancedee.com
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
