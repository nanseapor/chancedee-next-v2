import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonForm } from "@/components/ui/skeleton-form";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <Skeleton className="h-7 w-28" />

      {/* Settings sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4 sm:p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <SkeletonForm fields={3} />
        </div>
      ))}
    </div>
  );
}
