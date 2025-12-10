export function ChatSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {/* AI message skeleton */}
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* User message skeleton */}
      <div className="flex gap-3 justify-end">
        <div className="flex-1 space-y-2 flex flex-col items-end">
          <div className="h-4 bg-primary-100 rounded w-2/3" />
          <div className="h-4 bg-primary-100 rounded w-1/3" />
        </div>
        <div className="w-8 h-8 bg-primary-200 rounded-full flex-shrink-0" />
      </div>

      {/* AI message skeleton */}
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>

      {/* User message skeleton */}
      <div className="flex gap-3 justify-end">
        <div className="flex-1 space-y-2 flex flex-col items-end">
          <div className="h-4 bg-primary-100 rounded w-3/4" />
          <div className="h-4 bg-primary-100 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 bg-primary-200 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}
