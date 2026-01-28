import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCompanyProfile } from "@/lib/database/actions/company-public";
import { PublicCompanyProfileClient } from "./_components/PublicCompanyProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const company = await getPublicCompanyProfile(id);

  if (!company) {
    return {
      title: "ไม่พบบริษัท | ChanceDee Jobs",
    };
  }

  return {
    title: `${company.companyName} | ChanceDee Jobs`,
    description:
      company.shortDescriptionText ||
      `ดูโปรไฟล์และตำแหน่งงานจาก ${company.companyName}`,
    openGraph: {
      title: company.companyName,
      description:
        company.shortDescriptionText ||
        `ดูโปรไฟล์และตำแหน่งงานจาก ${company.companyName}`,
      images: company.profilePhoto ? [company.profilePhoto] : [],
    },
  };
}

/**
 * Public company profile page
 * Displays company information and open positions
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 * @route /jobsmarket/companies/[id]
 */
export default async function PublicCompanyProfilePage({ params }: PageProps) {
  const { id } = await params;

  // Pre-check if company exists and is visible
  const company = await getPublicCompanyProfile(id);

  // Server-side not found for completely invalid companies
  // This allows for proper 404 status code
  if (!company) {
    notFound();
  }

  // Render client component for interactive features
  return <PublicCompanyProfileClient companyId={id} />;
}
