import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function SavedLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <Skeleton className="h-7 w-36" />

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} showImage showBadge lines={2} />
        ))}
      </div>
    </div>
  );
}
