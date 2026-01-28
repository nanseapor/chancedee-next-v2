"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

/**
 * CAND-R03: Account Settings Link Card
 *
 * Links to AUTH-R06 /auth/settings page for:
 * - Password management
 * - Email changes
 * - Privacy settings
 * - Account deletion
 */
export function AccountLinkCard() {
  return (
    <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow">
      <Link
        href="/auth/settings"
        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-900">
            การตั้งค่าบัญชี
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            รหัสผ่าน, อีเมล, ความเป็นส่วนตัว
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Account Settings
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </Link>
    </Card>
  );
}
