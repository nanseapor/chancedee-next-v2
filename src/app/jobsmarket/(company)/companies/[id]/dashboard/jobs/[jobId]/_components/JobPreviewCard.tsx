"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import type { JobWithAnalytics } from '@/types/jobsmarket/job-detail.types';

interface JobPreviewCardProps {
  job: JobWithAnalytics;
}

const JOB_TYPE_LABELS = {
  'full-time': 'งานประจำ',
  'part-time': 'งานพาร์ทไทม์',
  contract: 'งานสัญญาจ้าง',
  temporary: 'งานชั่วคราว',
  internship: 'งานฝึกงาน',
};

const WORK_MODE_LABELS = {
  onsite: 'ทำงานที่ออฟฟิศ',
  remote: 'ทำงานที่บ้าน',
  hybrid: 'ทำงานแบบผสม',
};

export function JobPreviewCard({ job }: JobPreviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-medium tracking-wide leading-normal">
          ตัวอย่างประกาศงาน
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Title */}
        <div>
          <h3 className="text-2xl font-semibold tracking-wide leading-snug text-gray-900">
            {job.title}
          </h3>
          <p className="text-base text-gray-600 mt-1">{job.companyName}</p>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4 text-secondary-600" />
            <span>{job.workLocationText || job.workLocation || 'ไม่ระบุ'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Briefcase className="h-4 w-4 text-secondary-600" />
            <span>{job.jobTypeText || JOB_TYPE_LABELS[job.jobType as keyof typeof JOB_TYPE_LABELS] || job.jobType || 'ไม่ระบุ'}</span>
          </div>

          {(job.minSalary || job.maxSalary) && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DollarSign className="h-4 w-4 text-secondary-600" />
              <span>
                {job.isNegotiable
                  ? 'ตามตกลง'
                  : job.minSalary && job.maxSalary
                    ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} บาท`
                    : job.minSalary
                      ? `${job.minSalary.toLocaleString()}+ บาท`
                      : `${job.maxSalary?.toLocaleString()} บาท`
                }
              </span>
            </div>
          )}

          {job.employmentText && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-secondary-600" />
              <span>{job.employmentText}</span>
            </div>
          )}
        </div>

        {/* Description Preview */}
        {job.jobDescriptionText && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">รายละเอียดงาน</h4>
            <p className="text-sm text-gray-600 line-clamp-3 tracking-wider leading-relaxed">
              {job.jobDescriptionText}
            </p>
          </div>
        )}

        {/* Qualifications Preview */}
        {job.qualificationText && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">คุณสมบัติผู้สมัคร</h4>
            <p className="text-sm text-gray-600 line-clamp-3 tracking-wider leading-relaxed">
              {job.qualificationText}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
