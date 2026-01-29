import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonForm } from "@/components/ui/skeleton-form";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <Skeleton className="h-7 w-32" />

      <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Form fields */}
        <SkeletonForm fields={6} columns={2} />
      </div>
    </div>
  );
}
