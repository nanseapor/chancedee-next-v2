import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { SkeletonStats } from "@/components/ui/skeleton-stats";

export default function WalletLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <Skeleton className="h-7 w-28" />

      {/* Balance card */}
      <div className="bg-white rounded-lg border p-6 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>

      <SkeletonStats count={2} />

      {/* Transaction list */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
