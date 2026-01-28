import { Skeleton } from "@/components/ui/skeleton";

/**
 * Applications Page Skeleton Loader
 * Per CAND-R04 RIS §6 - Loading State
 *
 * Displays while:
 * - Auth checks are running
 * - Applications are being fetched
 */
export default function ApplicationsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Page title skeleton */}
      <Skeleton className="h-8 w-48 mb-6" />

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-10 w-28 rounded-full flex-shrink-0"
          />
        ))}
      </div>

      {/* Results count skeleton */}
      <Skeleton className="h-5 w-32 mb-4" />

      {/* Application cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {/* Company logo skeleton */}
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />

              {/* Content skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Status badge skeleton */}
              <Skeleton className="h-6 w-24 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
