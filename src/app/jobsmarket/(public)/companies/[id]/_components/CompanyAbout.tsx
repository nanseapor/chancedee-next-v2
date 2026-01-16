"use client";

import DOMPurify from "dompurify";
import { Info, Gift } from "lucide-react";

interface CompanyAboutProps {
  overview?: string;
  benefits?: string;
}

/**
 * Company about section with overview and benefits
 * Renders HTML content safely with DOMPurify
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 */
export function CompanyAbout({ overview, benefits }: CompanyAboutProps) {
  const hasOverview = overview && overview.trim().length > 0;
  const hasBenefits = benefits && benefits.trim().length > 0;

  // Sanitize HTML content
  const sanitizedOverview = hasOverview
    ? DOMPurify.sanitize(overview, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "b",
          "em",
          "i",
          "u",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "a",
        ],
        ALLOWED_ATTR: ["href", "target", "rel"],
      })
    : "";

  const sanitizedBenefits = hasBenefits
    ? DOMPurify.sanitize(benefits, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "b",
          "em",
          "i",
          "u",
          "ul",
          "ol",
          "li",
        ],
        ALLOWED_ATTR: [],
      })
    : "";

  return (
    <section data-testid="company-about" className="space-y-6">
      {/* About Section */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <Info size={20} className="text-secondary-600" />
          เกี่ยวกับบริษัท
        </h2>

        {hasOverview ? (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizedOverview }}
          />
        ) : (
          <p className="text-gray-500 italic">ยังไม่มีข้อมูล</p>
        )}
      </div>

      {/* Benefits Section */}
      {hasBenefits && (
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Gift size={20} className="text-secondary-600" />
            สวัสดิการ
          </h2>

          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizedBenefits }}
          />
        </div>
      )}
    </section>
  );
}
