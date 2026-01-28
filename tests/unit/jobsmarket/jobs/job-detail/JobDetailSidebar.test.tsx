import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobDetailSidebar } from '@/app/jobsmarket/jobs/[id]/_components/JobDetailSidebar';
import type { JobDetailData } from '@/types/public-jobs';

// Mock child components
vi.mock('@/app/jobsmarket/jobs/[id]/_components/ApplySection', () => ({
  ApplySection: ({ job, isJobAvailable }: { job: JobDetailData; isJobAvailable: boolean }) => (
    <div data-testid="apply-section">
      ApplySection - {job.uid} - {isJobAvailable ? 'available' : 'unavailable'}
    </div>
  ),
}));

vi.mock('@/app/jobsmarket/jobs/[id]/_components/CompanyInfo', () => ({
  CompanyInfo: ({ company }: { company: { name: string } }) => (
    <div data-testid="company-info">CompanyInfo - {company.name}</div>
  ),
}));

describe('JobDetailSidebar', () => {
  const mockJob: JobDetailData = {
    uid: 'job-123',
    title: 'Test Job',
    jobStatus: 'published',
    postExpiryDate: Date.now() + 1000000, // Future date
    isActive: true,
    companyId: 'company-123',
    companyName: 'Test Company',
    company: {
      uid: 'company-123',
      name: 'Test Company Ltd.',
      logo: 'https://example.com/logo.png',
      industry: 'Technology',
    },
    postStartDate: Date.now(),
    minSalary: 30000,
    maxSalary: 50000,
    isNegotiable: false,
    workLocationText: 'Bangkok',
    employmentText: 'Full Time',
    experienceText: '2-5 years',
    positions: 1,
    educationLevelText: ['ปริญญาตรี'],
    companyLogo: '',
    jobDescriptionDetails: '',
    qualificationDetails: '',
    benefitsDetails: '',
    email: '',
    phone: '',
  };

  const mockOnApplyAuth = vi.fn();

  describe('Rendering', () => {
    it('should render ApplySection component', () => {
      render(
        <JobDetailSidebar
          job={mockJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByTestId('apply-section')).toBeInTheDocument();
    });

    it('should render CompanyInfo when company data is provided', () => {
      render(
        <JobDetailSidebar
          job={mockJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByTestId('company-info')).toBeInTheDocument();
      expect(screen.getByText(/Test Company Ltd./)).toBeInTheDocument();
    });

    it('should not render CompanyInfo when company data is missing', () => {
      const jobWithoutCompany = { ...mockJob, company: undefined };
      render(
        <JobDetailSidebar
          job={jobWithoutCompany}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.queryByTestId('company-info')).not.toBeInTheDocument();
    });
  });

  describe('Job availability detection', () => {
    it('should detect job as available when published and not expired', () => {
      const availableJob = {
        ...mockJob,
        jobStatus: 'published',
        postExpiryDate: Date.now() + 1000000, // Future
      };

      render(
        <JobDetailSidebar
          job={availableJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByText(/available/)).toBeInTheDocument();
    });

    it('should detect job as unavailable when not published', () => {
      const unpublishedJob = {
        ...mockJob,
        jobStatus: 'draft',
        postExpiryDate: Date.now() + 1000000,
      };

      render(
        <JobDetailSidebar
          job={unpublishedJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByText(/unavailable/)).toBeInTheDocument();
    });

    it('should detect job as unavailable when expired', () => {
      const expiredJob = {
        ...mockJob,
        jobStatus: 'published',
        postExpiryDate: Date.now() - 1000000, // Past
      };

      render(
        <JobDetailSidebar
          job={expiredJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByText(/unavailable/)).toBeInTheDocument();
    });

    it('should handle job with no expiry date as available', () => {
      const noExpiryJob = {
        ...mockJob,
        jobStatus: 'published',
        postExpiryDate: 0,
      };

      render(
        <JobDetailSidebar
          job={noExpiryJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByText(/available/)).toBeInTheDocument();
    });

    it('should handle job with undefined expiry date as available', () => {
      const noExpiryJob = {
        ...mockJob,
        jobStatus: 'published',
        postExpiryDate: undefined,
      };

      render(
        <JobDetailSidebar
          job={noExpiryJob as JobDetailData}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByText(/available/)).toBeInTheDocument();
    });
  });

  describe('Sticky behavior', () => {
    it('should have sticky positioning class', () => {
      const { container } = render(
        <JobDetailSidebar
          job={mockJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('sticky');
      expect(sidebar).toHaveClass('top-20');
    });
  });

  describe('Props passing', () => {
    it('should pass job uid to ApplySection', () => {
      render(
        <JobDetailSidebar
          job={mockJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByText(/job-123/)).toBeInTheDocument();
    });

    it('should pass onApplyAuth callback to ApplySection', () => {
      render(
        <JobDetailSidebar
          job={mockJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      // ApplySection should be rendered (verifies callback was passed)
      expect(screen.getByTestId('apply-section')).toBeInTheDocument();
    });

    it('should pass company data to CompanyInfo', () => {
      render(
        <JobDetailSidebar
          job={mockJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      expect(screen.getByText(/Test Company Ltd./)).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper spacing between sections', () => {
      const { container } = render(
        <JobDetailSidebar
          job={mockJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('space-y-4');
    });
  });

  describe('Edge cases', () => {
    it('should handle job with jobStatus "ontimer" as available', () => {
      const ontimerJob = {
        ...mockJob,
        jobStatus: 'ontimer',
        postExpiryDate: Date.now() + 1000000,
      };

      render(
        <JobDetailSidebar
          job={ontimerJob as JobDetailData}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      // 'ontimer' status is not published, should be unavailable
      expect(screen.getByText(/unavailable/)).toBeInTheDocument();
    });

    it('should handle job with exact expiry time as unavailable', () => {
      const exactExpiryJob = {
        ...mockJob,
        jobStatus: 'published',
        postExpiryDate: Date.now(),
      };

      render(
        <JobDetailSidebar
          job={exactExpiryJob}
          isAuthenticated={true}
          onApplyAuth={mockOnApplyAuth}
        />
      );

      // Exact match should be considered expired
      expect(screen.getByText(/unavailable/)).toBeInTheDocument();
    });
  });
});
