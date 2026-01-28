export function JobListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          data-testid="skeleton-row"
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
