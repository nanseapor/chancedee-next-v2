import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "ข้อความ | Chancedee Jobs",
  description: "จัดการการสนทนาและข้อความของคุณ",
};

/**
 * Chat Layout
 *
 * Provides Suspense boundary and metadata for chat pages.
 * Authentication is handled by the parent (shared) layout via requireAuth().
 * Shell selection is handled by SharedShell in the parent layout.
 */
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ChatLayoutSkeleton />}>
      {children}
    </Suspense>
  );
}

function ChatLayoutSkeleton() {
  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* List Panel Skeleton */}
      <div className="w-full md:w-[320px] md:border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border space-y-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Room List Skeleton */}
        <div className="flex-1 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 border-b border-border"
            >
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel Skeleton (Desktop only) */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
