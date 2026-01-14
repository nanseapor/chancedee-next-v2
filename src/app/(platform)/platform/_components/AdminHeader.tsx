"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, LogOut } from "lucide-react";

import { useAdminAuth } from "@/hooks/jobsmarket/admin/use-admin-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Admin Header Component
 * Per ADM-R00 Cross-Cutting RIS §2.3 Header Specification
 *
 * Top header bar with:
 * - Page title with optional breadcrumb
 * - Global search input
 * - User menu (avatar, name, email, logout)
 *
 * Height: 64px
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  pageTitle: string;
  breadcrumb?: BreadcrumbItem[];
  onSearch?: (query: string) => void;
}

export function AdminHeader({ pageTitle, breadcrumb, onSearch }: AdminHeaderProps) {
  const { currentUserName, currentUserEmail, logout } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Get display name and email with fallbacks
  const displayName = currentUserName || "Admin User";
  const displayEmail = currentUserEmail || "admin@chancedee.com";

  // Get initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      data-testid="admin-header"
      className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6"
    >
      {/* Left: Title and Breadcrumb */}
      <div className="flex items-center gap-2">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight
                    data-testid="breadcrumb-separator"
                    className="h-4 w-4 text-gray-400"
                  />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
        )}
      </div>

      {/* Right: Search and User Menu */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div
          data-testid="admin-search"
          className="relative"
        >
          <Search
            data-testid="search-icon"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-9 w-64 rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-testid="user-avatar"
              className="h-8 w-8 rounded-full p-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt={displayName} />
                <AvatarFallback
                  data-testid="user-avatar-fallback"
                  className="bg-purple-100 text-sm font-medium text-purple-700"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="user-menu"
            align="end"
            className="w-56"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="logout-button"
              onClick={handleLogout}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
