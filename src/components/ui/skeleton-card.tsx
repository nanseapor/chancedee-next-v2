import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  showImage?: boolean;
  showBadge?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({
  showImage = false,
  showBadge = false,
  lines = 2,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-4 flex gap-4 items-start",
        className,
      )}
    >
      {showImage && <Skeleton className="h-12 w-12 rounded-lg shrink-0" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-1/2" />
        ))}
      </div>
      {showBadge && <Skeleton className="h-6 w-16 rounded-full shrink-0" />}
    </div>
  );
}
