import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Users, ExternalLink } from 'lucide-react';

interface CompanyInfoProps {
  company: {
    uid: string;
    name: string;
    logo?: string;
    industry?: string;
    size?: string;
    location?: string;
    about?: string;
  };
}

/**
 * Company Info Component
 *
 * Displays company information card with:
 * - Company logo and name
 * - Industry
 * - Location
 * - Company size
 * - About text (truncated to 3 lines)
 * - Link to company profile page
 */
export function CompanyInfo({ company }: CompanyInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">เกี่ยวกับบริษัท</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Logo & Name */}
        <div className="flex items-center gap-3">
          {company.logo ? (
            <Image
              src={company.logo}
              alt={company.name}
              width={48}
              height={48}
              className="rounded-lg object-contain bg-muted"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Building2 size={24} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-semibold">{company.name}</h3>
            {company.industry && (
              <p className="text-sm text-muted-foreground">{company.industry}</p>
            )}
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-2 text-sm">
          {company.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} />
              <span>{company.location}</span>
            </div>
          )}
          {company.size && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users size={14} />
              <span>{company.size} พนักงาน</span>
            </div>
          )}
        </div>

        {/* About (truncated) */}
        {company.about && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {company.about}
          </p>
        )}

        {/* View Company Link */}
        <Link
          href={`/companies/${company.uid}`}
          className="inline-flex items-center gap-1 text-sm text-secondary hover:underline"
        >
          ดูข้อมูลบริษัท
          <ExternalLink size={14} />
        </Link>
      </CardContent>
    </Card>
  );
}
