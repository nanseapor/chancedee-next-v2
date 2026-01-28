"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, Users, Briefcase } from "lucide-react";
import type { CompanyCardData } from "@/types/public-companies";

interface CompanyCardProps {
  company: CompanyCardData;
}

/**
 * CompanyCard - Display card for company in directory listing
 *
 * @specification COMP-R09 Company Directory
 */
export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      href={`/companies/${company.uid}`}
      data-testid={`company-card-${company.uid}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
    >
      <div className="flex gap-4">
        {/* Company Logo */}
        <div className="shrink-0">
          <div className="w-16 h-16 relative rounded-lg overflow-hidden border bg-muted">
            {company.profilePhoto ? (
              <Image
                src={company.profilePhoto}
                alt={company.companyName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Company Name */}
          <h3 className="font-semibold text-base line-clamp-1">
            {company.companyName}
          </h3>

          {/* Industry Badge */}
          {company.industryLabel && (
            <span className="inline-block text-sm text-muted-foreground mt-1">
              {company.industryLabel}
            </span>
          )}

          {/* Description */}
          {company.shortDescriptionText && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {company.shortDescriptionText}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
            {/* Company Size */}
            {company.companySizeLabel && (
              <span className="inline-flex items-center gap-1">
                <Users size={14} />
                {company.companySizeLabel}
              </span>
            )}

            {/* Open Jobs Count */}
            <span className="inline-flex items-center gap-1 text-secondary-700 font-medium">
              <Briefcase size={14} />
              {company.openJobsCount} ตำแหน่งงาน
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * CompanyCardSkeleton - Loading placeholder for CompanyCard
 */
export function CompanyCardSkeleton() {
  return (
    <div
      data-testid="company-card-skeleton"
      className="border rounded-lg p-4 bg-card animate-pulse"
    >
      <div className="flex gap-4">
        {/* Logo skeleton */}
        <div className="w-16 h-16 rounded-lg bg-muted" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded mt-2" />
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="flex gap-3 mt-3">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
