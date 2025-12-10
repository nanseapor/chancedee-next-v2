import { Skeleton } from "@/components/ui/skeleton";

const ProfileEditorSkeleton = () => {
  return (
    <div className="mx-auto flex w-full max-w-[700px] flex-col items-center justify-center gap-6 p-6">
      {/* Avatar section skeleton */}
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex w-full items-start gap-6 rounded-lg border p-4">
          <Skeleton className="h-[52px] w-[52px] rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Form skeleton */}
      <div className="flex w-full flex-col gap-8">
        {/* Personal Information Fields */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Address Fields */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="flex w-full justify-end py-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};

export default ProfileEditorSkeleton;
