import { describe, it, expect } from 'vitest';
import {
  getJobStatusColor,
  getJobStatusLabel,
  canEditJob,
  canDeleteJob,
  formatJobDate,
} from '@/lib/jobsmarket/company/job-list-utils';
import type { JobStatus, JobListItem } from '@/types/jobsmarket/jobs-list.types';

describe('job-list-utils', () => {
  describe('getJobStatusColor', () => {
    it('returns correct color classes for each status', () => {
      expect(getJobStatusColor('published')).toContain('bg-green-100');
      expect(getJobStatusColor('draft')).toContain('bg-gray-100');
      expect(getJobStatusColor('unpublished')).toContain('bg-amber-100');
      expect(getJobStatusColor('closed')).toContain('bg-rose-100');
      expect(getJobStatusColor('ontimer')).toContain('bg-blue-100');
    });
  });

  describe('getJobStatusLabel', () => {
    it('returns correct Thai labels for each status', () => {
      expect(getJobStatusLabel('published')).toBe('เผยแพร่แล้ว');
      expect(getJobStatusLabel('draft')).toBe('ร่าง');
      expect(getJobStatusLabel('unpublished')).toBe('หยุดชั่วคราว');
      expect(getJobStatusLabel('closed')).toBe('ปิดแล้ว');
      expect(getJobStatusLabel('ontimer')).toBe('รอเผยแพร่');
    });
  });

  describe('canEditJob', () => {
    it('returns true for non-closed jobs', () => {
      const job: JobListItem = {
        uid: 'job-1',
        title: 'Test Job',
        jobStatus: 'published',
        isActive: true,
        applicationCount: 5,
        unreadApplicationCount: 0,
        viewCount: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(canEditJob(job)).toBe(true);
    });

    it('returns false for closed jobs', () => {
      const job: JobListItem = {
        uid: 'job-1',
        title: 'Test Job',
        jobStatus: 'closed',
        isActive: false,
        applicationCount: 5,
        unreadApplicationCount: 0,
        viewCount: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(canEditJob(job)).toBe(false);
    });
  });

  describe('canDeleteJob', () => {
    it('returns true for draft jobs with no applications', () => {
      const job: JobListItem = {
        uid: 'job-1',
        title: 'Test Job',
        jobStatus: 'draft',
        isActive: false,
        applicationCount: 0,
        unreadApplicationCount: 0,
        viewCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(canDeleteJob(job)).toBe(true);
    });

    it('returns false for draft jobs with applications', () => {
      const job: JobListItem = {
        uid: 'job-1',
        title: 'Test Job',
        jobStatus: 'draft',
        isActive: false,
        applicationCount: 3,
        unreadApplicationCount: 0,
        viewCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(canDeleteJob(job)).toBe(false);
    });

    it('returns false for non-draft jobs', () => {
      const job: JobListItem = {
        uid: 'job-1',
        title: 'Test Job',
        jobStatus: 'published',
        isActive: true,
        applicationCount: 0,
        unreadApplicationCount: 0,
        viewCount: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      expect(canDeleteJob(job)).toBe(false);
    });
  });

  describe('formatJobDate', () => {
    it('formats timestamp to Thai date format (DD/MM/YYYY)', () => {
      const timestamp = new Date('2024-03-15').getTime();
      const formatted = formatJobDate(timestamp);
      expect(formatted).toBe('15/03/2024');
    });

    it('handles current date', () => {
      const now = Date.now();
      const formatted = formatJobDate(now);
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });
});
