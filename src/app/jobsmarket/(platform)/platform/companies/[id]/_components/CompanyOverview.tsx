"use client";

import { Mail, Phone, Globe, MapPin, Users, Briefcase, FileText } from "lucide-react";

import type { AdminCompanyDetail, AdminCompanyStats } from "@/lib/database/actions/admin-companies";

/**
 * CompanyOverview component
 * Per ADM-R02 Company Management RIS §3.2.2 Company Overview
 *
 * Displays company details including:
 * - Contact information
 * - Address
 * - Company profile
 * - Registration date
 * - Stats
 */

interface CompanyOverviewProps {
  company: AdminCompanyDetail;
  stats: AdminCompanyStats;
}

const COMPANY_SIZE_LABELS: Record<string, string> = {
  XS: "1-10 คน",
  S: "11-50 คน",
  M: "51-200 คน",
  L: "201-500 คน",
  XL: "501-1000 คน",
  XXL: "1000+ คน",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CompanyOverview({ company, stats }: CompanyOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100">
              <Briefcase className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ตำแหน่งงาน</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="job-count">
                {stats.jobCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100">
              <Users className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ทีมงาน</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="team-size">
                {stats.teamSize}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100">
              <FileText className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ใบสมัคร</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="application-count">
                {stats.applicationCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Address Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลติดต่อ</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">อีเมล</p>
                <p className="text-gray-900">{company.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">โทรศัพท์</p>
                <p className="text-gray-900">{company.phone || "ไม่ระบุ"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">เว็บไซต์</p>
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-600 hover:text-secondary-700 hover:underline"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <p className="text-gray-400">ไม่ระบุ</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ที่อยู่</h3>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="space-y-1">
              {company.address && <p className="text-gray-900">{company.address}</p>}
              <p className="text-gray-700">
                {[company.subDistrict, company.district].filter(Boolean).join(", ")}
                {company.district && " วัฒนา"}
              </p>
              <p className="text-gray-700">{company.province}</p>
              <p className="text-gray-700">{company.postCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Profile Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลบริษัท</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">อุตสาหกรรม</p>
            <p className="text-gray-900" data-testid="industry-value">
              {company.industry || "ไม่ระบุ"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">ขนาดบริษัท</p>
            <p className="text-gray-900" data-testid="company-size">
              {company.companySize
                ? COMPANY_SIZE_LABELS[company.companySize] || company.companySize
                : "ไม่ระบุ"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">เลขประจำตัวผู้เสียภาษี</p>
            <p className="text-gray-900">{company.taxId || "ไม่ระบุ"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">วันที่ลงทะเบียน</p>
            <p className="text-gray-900" data-testid="registration-date">
              {formatDate(company.createdAt)}
            </p>
          </div>
        </div>

        {/* Short Description */}
        {company.shortDescription && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">คำอธิบายสั้น</p>
            <p className="text-gray-900">{company.shortDescription}</p>
          </div>
        )}

        {/* Full Overview */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">รายละเอียดบริษัท</p>
          <p className="text-gray-900 whitespace-pre-line" data-testid="company-overview">
            {company.overview || "ไม่มีข้อมูล"}
          </p>
        </div>
      </div>
    </div>
  );
}
