import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for job detail page
 */
export default function JobDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <Skeleton className="w-16 h-16 rounded-md shrink-0" />

              <div className="flex-1 space-y-2">
                {/* Job Title */}
                <Skeleton className="h-8 w-3/4" />

                {/* Company Name */}
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>

            {/* Posted Date */}
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Metadata Skeleton */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Apply Section Skeleton */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Company Card Skeleton */}
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-md" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
