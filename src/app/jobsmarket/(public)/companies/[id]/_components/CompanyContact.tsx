"use client";

import { Globe, MapPin, ExternalLink, Train, Map } from "lucide-react";

interface CompanyContactProps {
  company: {
    website?: string;
    mapLocation?: string;
    travelMode?: string;
    travelStation?: string;
    address?: {
      address?: string;
      province?: string;
      district?: string;
      subDistrict?: string;
      postalCode?: string;
    };
  };
}

/**
 * Company contact section with website, location, and map
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 */
export function CompanyContact({ company }: CompanyContactProps) {
  const { website, mapLocation, travelMode, travelStation, address } = company;

  const hasWebsite = website && website.trim().length > 0;
  const hasAddress = address?.address || address?.province;
  const hasTravel = travelMode && travelStation;
  const hasAnyContact = hasWebsite || hasAddress || hasTravel;

  // Format website display text (remove protocol)
  const websiteDisplay = website
    ? website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "";

  // Format address display
  const addressParts = [
    address?.address,
    address?.subDistrict,
    address?.district,
    address?.province,
    address?.postalCode,
  ].filter(Boolean);

  return (
    <section
      data-testid="company-contact"
      className="bg-white rounded-lg border p-4 sm:p-6"
    >
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
        <MapPin size={20} className="text-secondary-600" />
        ข้อมูลติดต่อ
      </h2>

      {!hasAnyContact ? (
        <p className="text-gray-500 italic">ยังไม่มีข้อมูลติดต่อ</p>
      ) : (
        <div className="space-y-4">
          {/* Website */}
          {hasWebsite && (
            <div data-testid="company-website" className="flex items-start gap-3">
              <Globe size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-secondary-600 hover:text-secondary-700 hover:underline"
                >
                  {websiteDisplay}
                  <ExternalLink
                    data-testid="external-link-icon"
                    size={14}
                    className="shrink-0"
                  />
                </a>
              </div>
            </div>
          )}

          {/* Address */}
          {hasAddress && (
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-700">{addressParts.join(", ")}</p>

                {/* Map Link */}
                {mapLocation && (
                  <a
                    data-testid="map-link"
                    href={mapLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm text-secondary-600 hover:text-secondary-700 hover:underline"
                  >
                    <Map data-testid="map-icon" size={14} />
                    ดูแผนที่
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Travel Info */}
          {hasTravel && (
            <div className="flex items-start gap-3">
              <Train size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-gray-700">
                {travelMode} {travelStation}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
