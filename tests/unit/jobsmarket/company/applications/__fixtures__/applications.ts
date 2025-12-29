/**
 * COMP-R08: Test Fixtures for Application Components
 *
 * Provides mock data for unit testing:
 * - Mock applications
 * - Mock candidate profiles
 * - Mock match scores
 */

import type {
  ApplicationListItem,
  WorkExperience,
  Education,
  Language,
  MatchBreakdown,
} from '@/types/jobsmarket/applications.types';
import { MasterJobApplicationStatuses } from '@/constants/application';

export const mockApplication: ApplicationListItem = {
  uid: 'app-test-1',
  jobId: 'job-test-1',
  candidateId: 'cand-test-1',
  companyId: 'comp-test-1',
  hrId: null,
  status: MasterJobApplicationStatuses.new,
  expectedSalary: 50000,
  isNegotiable: true,
  overheadDays: 30,
  headlines: 'สนใจตำแหน่งนี้มาก มีประสบการณ์ตรงกับงาน',
  createdAt: Date.now() - 3600000, // 1 hour ago
  updatedAt: Date.now() - 3600000,
  candidateName: 'สมชาย ใจดี',
  candidatePhoto: null,
  candidateHeadline: 'Senior Full Stack Developer',
  jobTitle: 'Full Stack Developer',
  matchScore: 85,
  isUnread: true,
};

export const mockApplicationRead: ApplicationListItem = {
  ...mockApplication,
  uid: 'app-test-2',
  status: MasterJobApplicationStatuses.read,
  isUnread: false,
  matchScore: 72,
  candidateName: 'สมหญิง รักงาน',
  candidatePhoto: 'https://example.com/photo.jpg',
};

export const mockApplicationAccepted: ApplicationListItem = {
  ...mockApplication,
  uid: 'app-test-3',
  status: MasterJobApplicationStatuses.accepted,
  isUnread: false,
  matchScore: null,
  candidateName: 'วิชัย มานะ',
};

export const mockApplicationRejected: ApplicationListItem = {
  ...mockApplication,
  uid: 'app-test-4',
  status: MasterJobApplicationStatuses.rejected,
  isUnread: false,
  matchScore: 45,
  candidateName: 'ประเสริฐ ดี',
};

export const mockApplicationList: ApplicationListItem[] = [
  mockApplication,
  mockApplicationRead,
  mockApplicationAccepted,
  mockApplicationRejected,
  {
    ...mockApplication,
    uid: 'app-test-5',
    status: MasterJobApplicationStatuses.scheduled,
    isUnread: false,
    matchScore: 90,
  },
  {
    ...mockApplication,
    uid: 'app-test-6',
    status: MasterJobApplicationStatuses.confirmed,
    isUnread: false,
    matchScore: 88,
  },
  {
    ...mockApplication,
    uid: 'app-test-7',
    status: MasterJobApplicationStatuses.withdraw,
    isUnread: false,
    matchScore: 65,
  },
];

export const mockWorkExperience: WorkExperience[] = [
  {
    company: 'Tech Corporation',
    position: 'Senior Developer',
    startDate: 1609459200000, // 2021-01-01
    endDate: null,
    isCurrent: true,
    description: 'พัฒนาระบบ web application ด้วย React และ Node.js',
  },
  {
    company: 'Startup Co.',
    position: 'Junior Developer',
    startDate: 1546300800000, // 2019-01-01
    endDate: 1609459200000, // 2021-01-01
    isCurrent: false,
    description: 'พัฒนา mobile application',
  },
];

export const mockEducation: Education[] = [
  {
    institution: 'จุฬาลงกรณ์มหาวิทยาลัย',
    degree: 'ปริญญาตรี',
    field: 'วิทยาการคอมพิวเตอร์',
    graduationYear: 2018,
  },
  {
    institution: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
    degree: 'ปริญญาโท',
    field: 'วิศวกรรมซอฟต์แวร์',
    graduationYear: 2020,
  },
];

export const mockSkills = [
  'React',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Next.js',
  'GraphQL',
];

export const mockLanguages: Language[] = [
  { language: 'ไทย', proficiency: 'native' },
  { language: 'English', proficiency: 'fluent' },
  { language: '日本語', proficiency: 'conversational' },
  { language: '中文', proficiency: 'basic' },
];

export const mockMatchBreakdown: MatchBreakdown = {
  total: 85,
  skillMatch: 90,
  experienceMatch: 85,
  educationMatch: 80,
  salaryMatch: 75,
};

export const mockCandidateProfile = {
  photo: null as string | null,
  name: 'สมชาย ใจดี',
  headline: 'Senior Full Stack Developer with 5+ years experience',
  email: 'somchai.jaidee@example.com',
  phone: '+66812345678',
  workExperience: mockWorkExperience,
  education: mockEducation,
  skills: mockSkills,
  languages: mockLanguages,
  resumeUrl: 'https://example.com/resume.pdf',
};

export const mockCandidateProfileNoPhoto = {
  ...mockCandidateProfile,
  photo: null,
};

export const mockCandidateProfileWithPhoto = {
  ...mockCandidateProfile,
  photo: 'https://example.com/photo.jpg',
};

export const mockCandidateProfileEmpty = {
  photo: null,
  name: 'ทดสอบ ไม่มีข้อมูล',
  headline: null,
  email: 'test@example.com',
  phone: null,
  workExperience: [],
  education: [],
  skills: [],
  languages: [],
  resumeUrl: null,
};
