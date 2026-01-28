/**
 * COMP-R08: Candidate Header Component
 *
 * Displays candidate's basic info at top of detail panel:
 * - Avatar (photo or initial)
 * - Name and headline
 * - Contact info (email, phone)
 * - Match score badge
 *
 * Per COMP-R08 RIS §2.3 (Detail Panel)
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';

export interface CandidateHeaderProps {
  photo: string | null;
  name: string;
  headline: string | null;
  email: string;
  phone: string | null;
  matchScore: number | null;
}

export function CandidateHeader({
  photo,
  name,
  headline,
  email,
  phone,
  matchScore,
}: CandidateHeaderProps) {
  return (
    <div className="flex items-start gap-4 p-6 border-b border-gray-200 bg-white">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center">
            <span className="text-secondary-700 text-2xl font-semibold tracking-wide">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <h1 className="text-2xl font-semibold text-gray-900 tracking-wide leading-snug">
          {name}
        </h1>

        {/* Headline */}
        {headline && (
          <p className="text-base text-gray-600 tracking-wider leading-relaxed mt-1">
            {headline}
          </p>
        )}

        {/* Contact Info */}
        <div className="flex flex-col gap-1 mt-3">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-secondary-700 tracking-wider"
          >
            <Mail className="h-4 w-4" />
            {email}
          </a>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-secondary-700 tracking-wider"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          )}
        </div>
      </div>

      {/* Match Score Badge */}
      <div className="flex-shrink-0">
        {matchScore !== null ? (
          <Badge
            variant="outline"
            className={`
              text-sm font-medium tracking-widest px-3 py-1
              ${
                matchScore >= 80
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : matchScore >= 60
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              }
            `}
          >
            คะแนน: {matchScore}%
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-sm font-medium tracking-widest px-3 py-1 bg-gray-50 text-gray-500 border-gray-300"
          >
            ไม่มีคะแนน
          </Badge>
        )}
      </div>
    </div>
  );
}
