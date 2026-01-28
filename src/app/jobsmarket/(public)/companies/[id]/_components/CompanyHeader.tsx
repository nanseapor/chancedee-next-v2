"use client";

import Image from "next/image";
import { Building2, Users, BadgeCheck, Briefcase } from "lucide-react";
import type { FirebaseCompanyData } from "@/types/company.types";

interface CompanyHeaderProps {
  company: FirebaseCompanyData;
  jobsCount: number;
}

/**
 * Company header component with logo, name, stats, and verified badge
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 */
export function CompanyHeader({ company, jobsCount }: CompanyHeaderProps) {
  // Get company size display text
  const companySizeText = getCompanySizeText(company.companySize);

  // Get initials for fallback logo
  const initials = company.companyName.substring(0, 2);

  return (
    <div data-testid="company-header" className="relative">
      {/* Cover Photo */}
      <div className="relative h-32 sm:h-48 bg-gradient-to-r from-secondary-100 to-secondary-200 rounded-t-lg overflow-hidden">
        {company.coverPhoto && (
          <Image
            src={company.coverPhoto}
            alt=""
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="relative px-4 sm:px-6 pb-4">
        {/* Logo */}
        <div className="absolute -top-12 left-4 sm:left-6">
          <div
            data-testid="company-logo"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center"
          >
            {company.profilePhoto ? (
              <Image
                src={company.profilePhoto}
                alt={company.companyName}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-2xl font-semibold text-secondary-600">
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* Name and Info */}
        <div className="pt-12 sm:pt-14">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Company Name + Verified Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 line-clamp-2">
                  {company.companyName}
                </h1>
                {company.status === "approved" && (
                  <span
                    data-testid="verified-badge"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                  >
                    <BadgeCheck size={14} />
                    ยืนยันแล้ว
                  </span>
                )}
              </div>

              {/* Industry & Meta */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                {company.industry && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-50 text-secondary-700 rounded-full">
                    <Building2 size={14} />
                    {company.industry}
                  </span>
                )}

                {companySizeText && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} className="text-gray-400" />
                    {companySizeText}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 text-secondary-600 font-medium">
                  <Briefcase size={14} />
                  {jobsCount} ตำแหน่ง
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCompanySizeText(
  size: "S" | "M" | "L" | undefined
): string | undefined {
  if (!size) return undefined;

  const sizes: Record<string, string> = {
    S: "1-50 คน",
    M: "51-200 คน",
    L: "200+ คน",
  };

  return sizes[size];
}
