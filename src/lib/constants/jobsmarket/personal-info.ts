/**
 * Master data for personal information fields
 * Used in CAND-R02 Step 1: Personal Information
 */

export const TITLE_PREFIXES = [
  { value: 'mr', label: 'นาย' },
  { value: 'mrs', label: 'นาง' },
  { value: 'miss', label: 'นางสาว' },
  { value: 'other', label: 'อื่นๆ' },
] as const;

export const GENDERS = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่นๆ' },
  { value: 'prefer_not_to_say', label: 'ไม่ระบุ' },
] as const;

export const MARITAL_STATUSES = [
  { value: 'single', label: 'โสด' },
  { value: 'married', label: 'สมรส' },
  { value: 'divorced', label: 'หย่าร้าง' },
  { value: 'widowed', label: 'หม้าย' },
  { value: 'prefer_not_to_say', label: 'ไม่ระบุ' },
] as const;

export type TitlePrefix = typeof TITLE_PREFIXES[number]['value'];
export type Gender = typeof GENDERS[number]['value'];
export type MaritalStatus = typeof MARITAL_STATUSES[number]['value'];
