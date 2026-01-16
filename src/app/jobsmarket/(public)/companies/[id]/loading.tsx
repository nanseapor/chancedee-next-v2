import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for public company profile page
 * Shows skeleton while page is loading
 */
export default function PublicCompanyProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b px-4 py-2">
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-6">
          <Skeleton className="h-32 sm:h-48 rounded-t-lg" />
          <div className="px-4 sm:px-6 pb-4">
            <div className="pt-12 sm:pt-14 space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Sections Skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
