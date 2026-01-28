/**
 * COMP-R08: Loading skeleton for applications page
 *
 * Displays three-panel skeleton while data loads
 * Per COMP-R08 RIS §2 (Three-Panel Layout)
 */

import { Skeleton } from '@/components/ui/skeleton';

export function ApplicationsSkeleton() {
  return (
    <div className="flex h-[calc(100vh-var(--header-height))]">
      {/* Filter Panel Skeleton - 250px */}
      <aside className="w-[250px] flex-shrink-0 border-r border-gray-200 p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />

        <Skeleton className="h-6 w-24 mb-2" />
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>

        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </aside>

      {/* Application List Skeleton - 350px */}
      <div className="w-[350px] flex-shrink-0 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Application cards skeleton */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel Skeleton - flex grow */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        <Skeleton className="h-64 w-full" />
      </main>
    </div>
  );
}
