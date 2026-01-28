/**
 * COMP-R00: Minimal Shell Component
 *
 * Minimal layout for pending/rejected companies
 * Only shows header with logo and logout button
 * Per COMP-R00 implementation plan Phase 3
 */

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MinimalShellProps {
  children: React.ReactNode;
  companyName?: string;
  companyLogo?: string;
}

/**
 * Minimal shell for companies in pending/rejected state
 * Only shows header with logo and logout button
 * No sidebar, no navigation, no notifications
 */
export default function MinimalShell({
  children,
  companyName,
  companyLogo,
}: MinimalShellProps) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    // TODO: Implement logout logic
    // await signOut();
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo and company name */}
          <div className="flex items-center gap-2">
            {companyLogo ? (
              <Image
                src={companyLogo}
                alt={companyName || "Company"}
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
            )}
            {companyName && (
              <span className="font-semibold text-sm truncate max-w-[200px]">
                {companyName}
              </span>
            )}
          </div>

          {/* Logout button */}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </header>

      {/* Main content - centered for pending/rejection messages */}
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
    </div>
  );
}
