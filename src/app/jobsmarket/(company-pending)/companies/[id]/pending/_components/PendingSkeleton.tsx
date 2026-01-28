import { Skeleton } from '@/components/ui/skeleton';

export default function PendingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="max-w-lg w-full">
        {/* Icon placeholder */}
        <Skeleton className="w-16 h-16 mx-auto mb-6 rounded-full" />

        {/* Title */}
        <Skeleton className="h-8 w-48 mx-auto mb-4" />

        {/* Description */}
        <Skeleton className="h-4 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-56 mx-auto mb-6" />

        {/* Stepper placeholder */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
