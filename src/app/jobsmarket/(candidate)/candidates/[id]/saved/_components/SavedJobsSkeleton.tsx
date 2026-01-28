/**
 * CAND-R05: Loading Skeleton Component
 *
 * Displays placeholder cards while saved jobs are loading
 */

export function SavedJobsSkeleton() {
  return (
    <div data-testid="saved-jobs-skeleton" className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-6"
        >
          {/* Left side - Job info */}
          <div className="flex-1 space-y-3">
            {/* Job title */}
            <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />

            {/* Company name */}
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />

            {/* Location and salary */}
            <div className="flex gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          {/* Right side - Save button */}
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
