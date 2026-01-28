"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * SuspendedAccountCard - Displayed when user account is suspended
 * Per AUTH-R01 Implementation Plan §7 (Thai Copy)
 */
export function SuspendedAccountCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle className="text-xl">บัญชีของคุณถูกระงับชั่วคราว</CardTitle>
        <CardDescription className="mt-2">
          หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อฝ่ายสนับสนุน
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        <p>
          บัญชีของคุณถูกระงับเนื่องจากเหตุผลด้านความปลอดภัย
          หรืออาจละเมิดข้อกำหนดการใช้งาน
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href="mailto:support@chancedee.com">
            ติดต่อฝ่ายสนับสนุน
          </Link>
        </Button>
        <Button variant="ghost" asChild className="w-full">
          <Link href="/">
            กลับหน้าหลัก
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SuspendedAccountCard;
