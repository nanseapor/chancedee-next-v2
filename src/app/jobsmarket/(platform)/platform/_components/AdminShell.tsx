"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

import { useAdminAuth } from "@/hooks/jobsmarket/admin/use-admin-auth";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

/**
 * Admin Shell Component
 * Per ADM-R00 Cross-Cutting RIS §2 Admin Shell Specification
 *
 * Layout wrapper for all platform admin routes.
 * Desktop-only: blocks mobile access (min-width: 1024px)
 *
 * Layout dimensions:
 * - Sidebar: 280px fixed width
 * - Header: 64px height
 * - Background: gray-50
 */

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { isAdmin, isLoading, isReady } = useAdminAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 1023px)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div
        data-testid="admin-shell-loading"
        className="flex h-screen w-full items-center justify-center bg-gray-50"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <p className="text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isReady || !isAdmin) {
    return null;
  }

  // Show mobile blocker
  if (isMobile) {
    return (
      <div
        data-testid="admin-mobile-blocker"
        className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-gray-50 p-6 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <Monitor className="h-8 w-8 text-purple-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">
            Desktop Required
          </h1>
          <p className="max-w-sm text-sm text-gray-600">
            The admin panel is designed for desktop use. Please access this page
            from a computer with a screen width of at least 1024px.
          </p>
        </div>
      </div>
    );
  }

  // Render admin shell
  return (
    <div
      data-testid="admin-shell"
      className="flex h-screen w-full bg-gray-50"
    >
      {/* Sidebar - 280px fixed width */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - 64px height */}
        <AdminHeader pageTitle="Admin Panel" />

        {/* Main content */}
        <main
          data-testid="admin-main-content"
          className="flex-1 overflow-auto p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
