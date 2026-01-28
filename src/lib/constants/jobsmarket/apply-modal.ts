/**
 * Apply Modal Constants
 *
 * Constants for JOB-R02b apply modal
 * Based on RIS Section 3.3
 */

import type { AvailabilityOption } from '@/types/jobsmarket/apply-modal.types';

/**
 * Availability options for job applications
 * Maps overhead_days values to Thai/English labels
 */
export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  {
    value: 0,
    labelThai: 'ได้ทันที',
    labelEnglish: 'Immediately',
  },
  {
    value: 7,
    labelThai: 'ภายใน 1 สัปดาห์',
    labelEnglish: 'Within 1 week',
  },
  {
    value: 15,
    labelThai: 'ภายใน 2 สัปดาห์',
    labelEnglish: 'Within 2 weeks',
  },
  {
    value: 30,
    labelThai: 'ภายใน 1 เดือน',
    labelEnglish: 'Within 1 month',
  },
  {
    value: 60,
    labelThai: 'ภายใน 2 เดือน',
    labelEnglish: 'Within 2 months',
  },
  {
    value: 90,
    labelThai: 'ภายใน 3 เดือน',
    labelEnglish: 'Within 3 months',
  },
];

/**
 * Default form values
 * Based on RIS Section 3.4
 */
export const DEFAULT_APPLY_FORM = {
  expectedSalary: null,
  isNegotiable: true,
  overheadDays: 0, // "ได้ทันที" (Immediately)
  headlines: '',
} as const;

/**
 * Validation limits
 * Based on RIS Section 3.2 and BLS-03-01
 */
export const VALIDATION_LIMITS = {
  SALARY_MIN: 0,
  SALARY_MAX: 999999,
  HEADLINES_MAX_LENGTH: 500,
} as const;
