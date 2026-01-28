import { JobDetailData } from '@/types/public-jobs';
import { SalaryDisplay } from '@/components/jobsmarket/jobs/SalaryDisplay';
import { LocationBadge } from '@/components/jobsmarket/jobs/LocationBadge';
import { Briefcase, GraduationCap, Users } from 'lucide-react';

interface JobMetadataProps {
  job: JobDetailData;
}

/**
 * Job Metadata Component
 *
 * Displays job key information:
 * - Salary (using SalaryDisplay component)
 * - Location (using LocationBadge component)
 * - Employment type
 * - Experience required
 * - Education required
 * - Number of positions
 */
export function JobMetadata({ job }: JobMetadataProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card">
      {/* Salary */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          เงินเดือน
        </h3>
        <SalaryDisplay
          minSalary={job.minSalary}
          maxSalary={job.maxSalary}
          isNegotiable={job.isNegotiable}
          className="text-xl font-semibold text-secondary-700"
        />
      </div>

      {/* Grid Layout for Other Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Location */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            สถานที่ทำงาน
          </h3>
          <LocationBadge province={job.workLocationText} />
        </div>

        {/* Employment Type */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            รูปแบบการจ้างงาน
          </h3>
          <div className="flex items-center gap-2 text-base">
            <Briefcase size={16} className="text-secondary-600" />
            <span>{job.employmentText}</span>
          </div>
        </div>

        {/* Experience */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            ประสบการณ์
          </h3>
          <div className="flex items-center gap-2 text-base">
            <GraduationCap size={16} className="text-secondary-600" />
            <span>{job.experienceText}</span>
          </div>
        </div>

        {/* Positions */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            จำนวนที่รับ
          </h3>
          <div className="flex items-center gap-2 text-base">
            <Users size={16} className="text-secondary-600" />
            <span>{job.positions} ตำแหน่ง</span>
          </div>
        </div>
      </div>

      {/* Education */}
      {job.educationLevelText && job.educationLevelText.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            การศึกษา
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.educationLevelText.map((education, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-50 text-secondary-700 text-sm"
              >
                {education}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
