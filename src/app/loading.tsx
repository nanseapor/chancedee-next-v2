import { LoadingSpinner } from "@/components/common/loading-spinner";

const loading = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="lg" className="border-4" />
        <h2 className="text-lg font-semibold text-gray-700">กำลังโหลด...</h2>
      </div>
    </div>
  );
};

export default loading;
