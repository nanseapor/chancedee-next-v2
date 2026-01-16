"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicCompanyProfile } from "@/hooks/jobsmarket/company/use-public-company-profile";
import { CompanyHeader } from "./CompanyHeader";
import { CompanyAbout } from "./CompanyAbout";
import { CompanyOpenPositions } from "./CompanyOpenPositions";
import { CompanyContact } from "./CompanyContact";

interface PublicCompanyProfileClientProps {
  companyId: string;
}

/**
 * Client-side component for public company profile page
 * Handles data fetching, loading states, and error handling
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 */
export function PublicCompanyProfileClient({
  companyId,
}: PublicCompanyProfileClientProps) {
  const router = useRouter();
  const { company, jobs, isLoading, error, mutate } =
    usePublicCompanyProfile(companyId);

  // Loading state
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        message="เกิดข้อผิดพลาด กรุณาลองใหม่"
        onRetry={() => mutate()}
      />
    );
  }

  // Not found state (company doesn't exist or not visible)
  if (!company || company.status !== "approved" || !company.isActive) {
    return <NotFoundState />;
  }

  return (
    <main
      role="main"
      className="min-h-screen bg-gray-50 pb-8"
    >
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-1" />
          กลับ
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Company Header */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-6">
          <CompanyHeader company={company} jobsCount={jobs.length} />
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* About Section */}
          <CompanyAbout
            overview={company.overview}
            benefits={company.benefitsDetails}
          />

          {/* Open Positions */}
          <CompanyOpenPositions jobs={jobs} companyId={companyId} />

          {/* Contact Info */}
          <CompanyContact
            company={{
              website: company.website,
              mapLocation: company.mapLocation,
              travelMode: company.travelMode,
              travelStation: company.travelStation,
              address: {
                address: "",
                province: "",
                district: "",
                subDistrict: "",
                postalCode: "",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <div
      data-testid="company-profile-skeleton"
      className="min-h-screen bg-gray-50 pb-8"
    >
      <div className="bg-white border-b px-4 py-2">
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-6">
          <Skeleton className="h-32 sm:h-48 rounded-t-lg" />
          <div className="px-4 sm:px-6 pb-4">
            <div className="pt-12 sm:pt-14 space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Sections Skeleton */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  const router = useRouter();

  return (
    <div
      data-testid="company-not-found"
      className="min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <div className="text-center px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Building2 size={32} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          ไม่พบบริษัท
        </h1>
        <p className="text-gray-500 mb-6">
          บริษัทที่คุณกำลังค้นหาอาจถูกลบหรือไม่พร้อมใช้งาน
        </p>
        <Button variant="outline" onClick={() => router.push("/jobs")}>
          กลับไปค้นหางาน
        </Button>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <RefreshCw size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{message}</h1>
        <p className="text-gray-500 mb-6">
          กรุณาลองใหม่อีกครั้งหรือติดต่อทีมงาน
        </p>
        <Button onClick={onRetry}>
          <RefreshCw size={16} className="mr-2" />
          ลองใหม่
        </Button>
      </div>
    </div>
  );
}
