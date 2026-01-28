/**
 * COMP-R00: Company Header Component
 *
 * Top header bar with logo, company name, and user menu
 * Per COMP-R00 implementation plan Phase 3
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CompanyProfile } from "@/types/jobsmarket/company";

interface CompanyHeaderProps {
  company: CompanyProfile;
  userName?: string;
  userAvatar?: string;
  onMenuToggle?: () => void;
  onLogout?: () => void;
  showMenuButton?: boolean;
}

export default function CompanyHeader({
  company,
  userName,
  userAvatar,
  onMenuToggle,
  onLogout,
  showMenuButton = true,
}: CompanyHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile menu button */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
            aria-label="เปิดเมนู"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Company logo and name */}
        <Link
          href={`/companies/${company.uid}/dashboard`}
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
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
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
          {/* Badge - implement with real count later */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" /> */}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  {userName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 hidden sm:block" />
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
    </header>
  );
}
