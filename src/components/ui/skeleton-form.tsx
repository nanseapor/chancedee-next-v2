import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonFormProps {
  fields?: number;
  columns?: 1 | 2;
  className?: string;
}

export function SkeletonForm({
  fields = 4,
  columns = 1,
  className,
}: SkeletonFormProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        columns === 2 && "grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-0",
        className,
      )}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
