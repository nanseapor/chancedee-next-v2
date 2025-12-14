"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cookie } from "lucide-react";

export function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">ความเป็นส่วนตัว</h3>
        <p className="text-sm text-muted-foreground">Privacy</p>
      </div>

      {/* Cookie Settings Section */}
      <div className="space-y-3">
        <h4 className="text-base font-medium">การตั้งค่าคุกกี้</h4>
        <p className="text-sm text-muted-foreground">Cookie Settings</p>

        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h5 className="font-medium">จัดการความยินยอมคุกกี้</h5>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage Cookie Consent
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                ควบคุมว่าเราใช้คุกกี้ประเภทใดบ้างในการให้บริการ
              </p>
              <p className="text-xs text-muted-foreground">
                Control which types of cookies we use to provide our services
              </p>

              <div className="pt-2">
                <Link href="/jobsmarket/privacy/cookie-settings">
                  <Button variant="outline" className="w-full sm:w-auto">
                    จัดการการตั้งค่าคุกกี้
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Privacy Policy Link */}
      <div className="space-y-3">
        <h4 className="text-base font-medium">นโยบายความเป็นส่วนตัว</h4>
        <p className="text-sm text-muted-foreground">Privacy Policy</p>

        <Card className="p-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              อ่านนโยบายความเป็นส่วนตัวของเราเพื่อเรียนรู้เพิ่มเติมเกี่ยวกับวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ
            </p>
            <p className="text-xs text-muted-foreground">
              Read our privacy policy to learn more about how we collect, use, and protect your personal information
            </p>

            <div className="pt-2">
              <Link href="/jobsmarket/privacy">
                <Button variant="link" className="h-auto p-0">
                  อ่านนโยบายความเป็นส่วนตัว
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
