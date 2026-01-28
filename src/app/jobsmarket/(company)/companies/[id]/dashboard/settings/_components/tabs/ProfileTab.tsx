"use client";

import { LogoUploader } from "../profile/LogoUploader";
import { CoverUploader } from "../profile/CoverUploader";
import { CompanyInfoForm } from "../profile/CompanyInfoForm";
import { CompanyLinksForm } from "../profile/CompanyLinksForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================
// Types
// ============================================

interface CompanyData {
  uid: string;
  company_name?: string;
  company_name_en?: string;
  industry?: string;
  company_size?: "S" | "M" | "L";
  founded_year?: number;
  description?: string;
  profile_photo?: string;
  cover_photo?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
}

interface CompanyInfoData {
  uid?: string;
  company_name: string;
  company_name_en?: string;
  industry?: string;
  company_size?: "S" | "M" | "L";
  founded_year?: number;
  description?: string;
}

interface CompanyLinksData {
  website?: string;
  facebook?: string;
  linkedin?: string;
}

interface ProfileTabProps {
  company: CompanyData;
  onUpdate: (type: string, data: Record<string, unknown>) => Promise<void>;
  canEdit: boolean;
}

// ============================================
// Component
// ============================================

export function ProfileTab({ company, onUpdate, canEdit }: ProfileTabProps) {
  const handleInfoSubmit = (data: CompanyInfoData) => {
    void onUpdate("profile", data as unknown as Record<string, unknown>);
  };

  const handleLinksSubmit = (data: CompanyLinksData) => {
    void onUpdate("links", data as unknown as Record<string, unknown>);
  };

  const handleLogoUpload = async (file: File) => {
    await onUpdate("logo", { file });
  };

  const handleLogoRemove = async () => {
    await onUpdate("logo", { remove: true });
  };

  const handleCoverUpload = async (file: File) => {
    await onUpdate("cover", { file });
  };

  const handleCoverRemove = async () => {
    await onUpdate("cover", { remove: true });
  };

  return (
    <div className="space-y-8">
      {/* Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">รูปภาพบริษัท</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <LogoUploader
              currentLogo={company.profile_photo}
              onUpload={handleLogoUpload}
              onRemove={handleLogoRemove}
              disabled={!canEdit}
            />
            <CoverUploader
              currentCover={company.cover_photo}
              onUpload={handleCoverUpload}
              onRemove={handleCoverRemove}
              disabled={!canEdit}
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ข้อมูลบริษัท</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyInfoForm
            initialData={{
              uid: company.uid,
              company_name: company.company_name || "",
              company_name_en: company.company_name_en || "",
              industry: company.industry || "",
              company_size: company.company_size,
              founded_year: company.founded_year,
              description: company.description || "",
            }}
            onSubmit={handleInfoSubmit}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>

      {/* Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ลิงก์</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyLinksForm
            initialData={{
              website: company.website || "",
              facebook: company.facebook || "",
              linkedin: company.linkedin || "",
            }}
            onSubmit={handleLinksSubmit}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
