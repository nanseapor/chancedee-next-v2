import { Skeleton } from "@/components/ui/skeleton";

const ProfilePageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <Skeleton className="h-8 w-64 mb-4 md:mb-0" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col">
        <div className="flex space-x-4 mb-4">
          {["Profile", "Bookmarks", "Settings"].map((tab, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Profile Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>

          {/* Bookmarks Section Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Settings Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;
