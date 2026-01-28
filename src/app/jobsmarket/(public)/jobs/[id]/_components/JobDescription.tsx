import { JobDetailData } from '@/types/public-jobs';
import { Mail, Phone } from 'lucide-react';

interface JobDescriptionProps {
  job: JobDetailData;
}

/**
 * Job Description Component
 *
 * Displays rich text content sections:
 * - Job description (jobDescriptionDetails)
 * - Qualifications (qualificationDetails)
 * - Benefits (benefitsDetails)
 * - Contact information (email, phone)
 *
 * Note: HTML content is rendered with dangerouslySetInnerHTML
 * since it comes from company input via Directus CMS rich text editor
 */
export function JobDescription({ job }: JobDescriptionProps) {
  return (
    <div className="space-y-8">
      {/* Job Description */}
      {job.jobDescriptionDetails && (
        <section>
          <h2 className="text-2xl font-semibold tracking-wide leading-snug mb-4">
            รายละเอียดงาน
          </h2>
          <div
            className="prose prose-sm sm:prose max-w-none
              prose-headings:font-semibold prose-headings:tracking-wide
              prose-p:leading-relaxed prose-p:tracking-wider
              prose-ul:leading-relaxed prose-ol:leading-relaxed
              prose-li:tracking-wider"
            dangerouslySetInnerHTML={{ __html: job.jobDescriptionDetails }}
          />
        </section>
      )}

      {/* Qualifications */}
      {job.qualificationDetails && (
        <section>
          <h2 className="text-2xl font-semibold tracking-wide leading-snug mb-4">
            คุณสมบัติผู้สมัคร
          </h2>
          <div
            className="prose prose-sm sm:prose max-w-none
              prose-headings:font-semibold prose-headings:tracking-wide
              prose-p:leading-relaxed prose-p:tracking-wider
              prose-ul:leading-relaxed prose-ol:leading-relaxed
              prose-li:tracking-wider"
            dangerouslySetInnerHTML={{ __html: job.qualificationDetails }}
          />
        </section>
      )}

      {/* Benefits */}
      {job.benefitsDetails && (
        <section>
          <h2 className="text-2xl font-semibold tracking-wide leading-snug mb-4">
            สวัสดิการ
          </h2>
          <div
            className="prose prose-sm sm:prose max-w-none
              prose-headings:font-semibold prose-headings:tracking-wide
              prose-p:leading-relaxed prose-p:tracking-wider
              prose-ul:leading-relaxed prose-ol:leading-relaxed
              prose-li:tracking-wider"
            dangerouslySetInnerHTML={{ __html: job.benefitsDetails }}
          />
        </section>
      )}

      {/* Contact Information */}
      {(job.email || job.phone) && (
        <section className="border-t pt-6">
          <h2 className="text-xl font-medium tracking-wide leading-normal mb-4">
            ติดต่อสอบถาม
          </h2>
          <div className="space-y-2">
            {job.email && (
              <div className="flex items-center gap-2 text-base">
                <Mail size={16} className="text-secondary-600" />
                <a
                  href={`mailto:${job.email}`}
                  className="text-secondary-700 hover:underline"
                >
                  {job.email}
                </a>
              </div>
            )}

            {job.phone && (
              <div className="flex items-center gap-2 text-base">
                <Phone size={16} className="text-secondary-600" />
                <a
                  href={`tel:${job.phone}`}
                  className="text-secondary-700 hover:underline"
                >
                  {job.phone}
                </a>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
