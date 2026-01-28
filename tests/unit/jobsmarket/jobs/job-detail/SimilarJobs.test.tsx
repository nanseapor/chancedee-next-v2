import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SimilarJobs } from '@/app/jobsmarket/jobs/[id]/_components/SimilarJobs';
import type { JobCardData } from '@/types/public-jobs';

// Mock dependencies
vi.mock('@/domains/jobs/services/server/actions/jobsmarket/public-jobs', () => ({
  getSimilarJobs: vi.fn(),
}));

vi.mock('@/components/jobsmarket/jobs/JobCard', () => ({
  JobCard: ({ job, variant, showSaveButton }: { job: JobCardData; variant: string; showSaveButton: boolean }) => (
    <div data-testid={`job-card-${job.uid}`} data-variant={variant} data-show-save={showSaveButton}>
      <h3>{job.title}</h3>
      <p>{job.companyName}</p>
    </div>
  ),
}));

import { getSimilarJobs } from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';

describe('SimilarJobs', () => {
  const mockJobs: JobCardData[] = [
    {
      uid: 'job-1',
      title: 'Similar Job 1',
      companyId: 'company-1',
      companyName: 'Company A',
      companyLogo: '',
      minSalary: 30000,
      maxSalary: 50000,
      isNegotiable: false,
      workLocationText: 'Bangkok',
      employmentText: 'Full Time',
      experienceText: '2-5 years',
      postStartDate: Date.now(),
    },
    {
      uid: 'job-2',
      title: 'Similar Job 2',
      companyId: 'company-2',
      companyName: 'Company B',
      companyLogo: '',
      minSalary: 40000,
      maxSalary: 60000,
      isNegotiable: false,
      workLocationText: 'Bangkok',
      employmentText: 'Full Time',
      experienceText: '3-5 years',
      postStartDate: Date.now(),
    },
    {
      uid: 'job-3',
      title: 'Similar Job 3',
      companyId: 'company-3',
      companyName: 'Company C',
      companyLogo: '',
      minSalary: 35000,
      maxSalary: 55000,
      isNegotiable: false,
      workLocationText: 'Bangkok',
      employmentText: 'Full Time',
      experienceText: '2-4 years',
      postStartDate: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render similar jobs grid when jobs are available', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockJobs,
      });

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        expect(screen.getByText('งานที่คล้ายกัน')).toBeInTheDocument();
      });

      expect(screen.getByTestId('job-card-job-1')).toBeInTheDocument();
      expect(screen.getByTestId('job-card-job-2')).toBeInTheDocument();
      expect(screen.getByTestId('job-card-job-3')).toBeInTheDocument();
    });

    it('should render section title', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockJobs,
      });

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /งานที่คล้ายกัน/i })).toBeInTheDocument();
      });
    });

    it('should use grid layout for job cards', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockJobs,
      });

      const { container } = render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
      });
    });
  });

  describe('Loading state', () => {
    it('should show loading skeleton while fetching', () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {}) // Never resolves
      );

      render(<SimilarJobs jobId="test-job-123" />);

      // Check for skeleton elements
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show 3 skeleton cards by default', () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise(() => {})
      );

      const { container } = render(<SimilarJobs jobId="test-job-123" />);

      const skeletonCards = container.querySelectorAll('.p-4.border.rounded-lg');
      expect(skeletonCards.length).toBe(3);
    });
  });

  describe('Empty state', () => {
    it('should hide section when no similar jobs', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [],
      });

      const { container } = render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });

      expect(screen.queryByText('งานที่คล้ายกัน')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should show error message on fetch failure', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: 'Failed to fetch similar jobs',
      });

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        expect(screen.getByText('ไม่สามารถโหลดงานที่คล้ายกันได้')).toBeInTheDocument();
      });
    });

    it('should handle thrown errors gracefully', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        expect(screen.getByText('ไม่สามารถโหลดงานที่คล้ายกันได้')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Similar jobs error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('JobCard integration', () => {
    it('should use compact variant for JobCard', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockJobs[0]],
      });

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        const jobCard = screen.getByTestId('job-card-job-1');
        expect(jobCard).toHaveAttribute('data-variant', 'compact');
      });
    });

    it('should hide save button on JobCard', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockJobs[0]],
      });

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        const jobCard = screen.getByTestId('job-card-job-1');
        expect(jobCard).toHaveAttribute('data-show-save', 'false');
      });
    });

    it('should pass job data to JobCard', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: [mockJobs[0]],
      });

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        expect(screen.getByText('Similar Job 1')).toBeInTheDocument();
        expect(screen.getByText('Company A')).toBeInTheDocument();
      });
    });
  });

  describe('Limit parameter', () => {
    it('should use default limit of 6', async () => {
      const getSimilarJobsMock = getSimilarJobs as ReturnType<typeof vi.fn>;
      getSimilarJobsMock.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        expect(getSimilarJobsMock).toHaveBeenCalledWith('test-job-123', 6);
      });
    });

    it('should use custom limit when provided', async () => {
      const getSimilarJobsMock = getSimilarJobs as ReturnType<typeof vi.fn>;
      getSimilarJobsMock.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<SimilarJobs jobId="test-job-123" limit={3} />);

      await waitFor(() => {
        expect(getSimilarJobsMock).toHaveBeenCalledWith('test-job-123', 3);
      });
    });

    it('should respect limit in displayed results', async () => {
      const sixJobs = Array.from({ length: 6 }, (_, i) => ({
        ...mockJobs[0],
        uid: `job-${i + 1}`,
        title: `Job ${i + 1}`,
      }));

      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: sixJobs,
      });

      render(<SimilarJobs jobId="test-job-123" limit={6} />);

      await waitFor(() => {
        const jobCards = document.querySelectorAll('[data-testid^="job-card-"]');
        expect(jobCards.length).toBe(6);
      });
    });
  });

  describe('Props passing', () => {
    it('should pass jobId to getSimilarJobs', async () => {
      const getSimilarJobsMock = getSimilarJobs as ReturnType<typeof vi.fn>;
      getSimilarJobsMock.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<SimilarJobs jobId="custom-job-id" />);

      await waitFor(() => {
        expect(getSimilarJobsMock).toHaveBeenCalledWith('custom-job-id', 6);
      });
    });
  });

  describe('Responsive layout', () => {
    it('should have responsive grid classes', async () => {
      (getSimilarJobs as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockJobs,
      });

      const { container } = render(<SimilarJobs jobId="test-job-123" />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        // 1 column on mobile, 2 on sm, 3 on lg
        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('sm:grid-cols-2');
        expect(grid).toHaveClass('lg:grid-cols-3');
      });
    });
  });
});
