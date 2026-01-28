import { Skeleton } from "@/components/ui/skeleton";

/**
 * Wizard skeleton loading state
 * Shows placeholder UI while draft is loading
 */
export function WizardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Progress bar skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Form skeleton */}
      <div className="space-y-6 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-2/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>

      {/* Navigation skeleton */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
