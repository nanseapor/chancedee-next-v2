/**
 * Master data for education fields
 * Used in CAND-R02 Step 3: Education
 */

export const EDUCATION_LEVELS = [
  { value: 'below_bachelor', label: 'ต่ำกว่าปริญญาตรี' },
  { value: 'bachelor', label: 'ปริญญาตรี' },
  { value: 'master', label: 'ปริญญาโท' },
  { value: 'doctorate', label: 'ปริญญาเอก' },
] as const;

export type EducationLevel = typeof EDUCATION_LEVELS[number]['value'];
