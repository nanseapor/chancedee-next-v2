/**
 * COMP-R00: Company Header Component
 *
 * Top header bar with logo, company name, notification bell, and hamburger menu (mobile)
 * Desktop shows user avatar dropdown; mobile shows MobileNavbar with nav + user actions
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, LogOut, ChevronDown, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import type { CompanyProfile, Permission, NavBadgeCounts } from "@/types/jobsmarket/company";
import {
  getVisibleNavItems,
  buildNavHref,
} from "@/lib/jobsmarket/company/navigation";

interface CompanyHeaderProps {
  company: CompanyProfile;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  hasPermission?: (permission: Permission) => boolean;
  badgeCounts?: NavBadgeCounts;
}

export default function CompanyHeader({
  company,
  userName,
  userAvatar,
  onLogout,
  hasPermission,
  badgeCounts,
}: CompanyHeaderProps) {
  const pathname = usePathname();
  const navItems = hasPermission ? getVisibleNavItems(hasPermission) : [];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-30 w-full h-14 border-b border-gray-200 bg-white">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Company logo and name */}
        <Link
          href={process.env.NEXT_PUBLIC_CONTENT_HOST || `/companies/${company.uid}/dashboard`}
          className="flex items-center gap-2 font-semibold"
        >
          {company.profilePhoto ? (
            <Image
              src={company.profilePhoto}
              alt={company.companyName}
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
              <span className="text-sm font-bold text-secondary-700">
                {company.companyName.charAt(0)}
              </span>
            </div>
          )}
          <span className="hidden sm:inline-block text-sm truncate max-w-[200px]">
            {company.companyName}
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Desktop: User dropdown (hidden on mobile) */}
        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>
                    {userName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName || "ผู้ใช้"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {company.companyName}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: Hamburger menu with nav + user actions */}
        <div className="lg:hidden">
          <MobileNavbar breakpointClass="lg:hidden" topOffset="top-[56px]">
            <div className="rounded-b-lg bg-white px-4 py-6 shadow-xl border-t border-gray-200">
              {/* User info */}
              <div className="flex items-center gap-3 px-2 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-secondary-600 text-white">
                    {userName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userName || "ผู้ใช้"}
                  </p>
                  <p className="text-xs text-gray-500">{company.companyName}</p>
                </div>
              </div>

              <Separator className="mb-2" />

              {/* Navigation links */}
              <nav className="flex flex-col">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const href = buildNavHref(company.uid, item);
                  const active = isActive(href);
                  const badgeCount = item.badgeKey
                    ? badgeCounts?.[item.badgeKey]
                    : undefined;

                  return (
                    <Link
                      key={item.key}
                      href={href}
                      className={`flex items-center gap-3 px-2 py-3 text-sm rounded-lg ${
                        active
                          ? "text-secondary-700 bg-secondary-50 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{item.label}</span>
                      {badgeCount !== undefined && badgeCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <Separator className="my-2" />

              {/* User actions */}
              <nav className="flex flex-col">
                <Link
                  href="/auth/settings"
                  className="flex items-center gap-3 px-2 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span>โปรไฟล์</span>
                </Link>
                <Link
                  href="/auth/settings"
                  className="flex items-center gap-3 px-2 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Settings className="w-4 h-4" />
                  <span>การตั้งค่า</span>
                </Link>
              </nav>

              <Separator className="my-2" />

              {/* Logout */}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-2 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </MobileNavbar>
        </div>
      </div>
    </header>
  );
}
