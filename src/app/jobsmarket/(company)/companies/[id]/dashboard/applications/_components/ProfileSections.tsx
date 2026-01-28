/**
 * COMP-R08: Profile Sections Component
 *
 * Displays candidate profile information:
 * - Work Experience (timeline)
 * - Education
 * - Skills (tag cloud)
 * - Languages with proficiency
 *
 * Per COMP-R08 RIS §4.3 (Candidate Profile)
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Award, Languages } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import type {
  WorkExperience,
  Education,
  Language,
} from '@/types/jobsmarket/applications.types';

export interface ProfileSectionsProps {
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: Language[];
}

/**
 * Get Thai label for language proficiency
 */
function getProficiencyLabel(level: Language['proficiency']): string {
  const labels: Record<Language['proficiency'], string> = {
    basic: 'พื้นฐาน',
    conversational: 'สื่อสารได้',
    fluent: 'คล่องแคล่ว',
    native: 'เจ้าของภาษา',
  };
  return labels[level];
}

export function ProfileSections({
  experience,
  education,
  skills,
  languages,
}: ProfileSectionsProps) {
  return (
    <div className="space-y-6">
      {/* Work Experience Section */}
      <section className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-secondary-600" />
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug">
            ประสบการณ์ทำงาน
          </h2>
        </div>

        {experience.length === 0 ? (
          <p className="text-sm text-gray-500 tracking-wider">
            ไม่มีข้อมูลประสบการณ์ทำงาน
          </p>
        ) : (
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index} className="pl-4 border-l-2 border-secondary-200">
                <h3 className="font-medium text-gray-900 tracking-wide">
                  {exp.position}
                </h3>
                <p className="text-sm text-gray-600 tracking-wider">
                  {exp.company}
                </p>
                <p className="text-xs text-gray-500 tracking-widest mt-1">
                  {format(new Date(exp.startDate), 'MMM yyyy', { locale: th })} -{' '}
                  {exp.isCurrent
                    ? 'ปัจจุบัน'
                    : format(new Date(exp.endDate!), 'MMM yyyy', { locale: th })}
                </p>
                {exp.description && (
                  <p className="text-sm text-gray-700 tracking-wider leading-relaxed mt-2">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Education Section */}
      <section className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-secondary-600" />
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug">
            การศึกษา
          </h2>
        </div>

        {education.length === 0 ? (
          <p className="text-sm text-gray-500 tracking-wider">
            ไม่มีข้อมูลการศึกษา
          </p>
        ) : (
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={index}>
                <h3 className="font-medium text-gray-900 tracking-wide">
                  {edu.degree} - {edu.field}
                </h3>
                <p className="text-sm text-gray-600 tracking-wider">
                  {edu.institution}
                </p>
                <p className="text-xs text-gray-500 tracking-widest mt-1">
                  จบการศึกษา {edu.graduationYear}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Skills Section */}
      <section className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-secondary-600" />
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug">
            ทักษะ
          </h2>
        </div>

        {skills.length === 0 ? (
          <p className="text-sm text-gray-500 tracking-wider">
            ไม่มีข้อมูลทักษะ
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100 tracking-wider"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </section>

      {/* Languages Section */}
      <section className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Languages className="h-5 w-5 text-secondary-600" />
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug">
            ภาษา
          </h2>
        </div>

        {languages.length === 0 ? (
          <p className="text-sm text-gray-500 tracking-wider">
            ไม่มีข้อมูลภาษา
          </p>
        ) : (
          <div className="space-y-2">
            {languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 tracking-wider">
                  {lang.language}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs tracking-widest"
                >
                  {getProficiencyLabel(lang.proficiency)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
