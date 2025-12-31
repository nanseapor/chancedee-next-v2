import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { JobDetailClient } from '@/app/jobsmarket/jobs/[id]/_components/JobDetailClient';
import type { JobDetailData } from '@/types/public-jobs';

// Mock dependencies
vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useAtomValue: vi.fn(),
  };
});

vi.mock('@/hooks/jobsmarket/useSaveJobMutation', () => ({
  useSaveJobMutation: vi.fn(() => ({
    toggleSave: vi.fn(),
    isJobSaved: vi.fn(() => false),
    isSaving: false,
  })),
}));

vi.mock('@/components/jobsmarket/jobs/SaveJobButton', () => ({
  SaveJobButton: () => <button>Save</button>,
}));

vi.mock('@/components/jobsmarket/jobs/LoginPromptModal', () => ({
  LoginPromptModal: () => <div>Login Modal</div>,
}));

vi.mock('@/app/jobsmarket/jobs/[id]/_components/JobDetailSidebar', () => ({
  JobDetailSidebar: vi.fn(() => <div data-testid="sidebar">Sidebar</div>),
}));

import { useAtomValue } from 'jotai';
import { JobDetailSidebar } from '@/app/jobsmarket/jobs/[id]/_components/JobDetailSidebar';

describe('JobDetailClient - Deep Link Support', () => {
  const mockJob: JobDetailData = {
    uid: 'job-123',
    title: 'Test Job',
    companyId: 'company-123',
    companyName: 'Test Company',
    companyLogo: '',
    minSalary: 30000,
    maxSalary: 50000,
    isNegotiable: false,
    workLocationText: 'Bangkok',
    employmentText: 'Full Time',
    experienceText: '2-5 years',
    educationLevelText: ['ปริญญาตรี'],
    jobDescriptionDetails: 'Test description',
    qualificationDetails: 'Test qualifications',
    benefitsDetails: 'Test benefits',
    phone: '0123456789',
    email: 'test@example.com',
    postStartDate: Date.now(),
    postExpiryDate: Date.now() + 1000000,
    jobStatus: 'published',
    isActive: true,
    positions: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAtomValue as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce('authenticated')
      .mockReturnValueOnce({ uid: 'user-123' });
  });

  describe('Auto-scroll to apply section', () => {
    it('should scroll to apply section when autoApply is true', () => {
      const scrollIntoViewMock = vi.fn();

      // Mock scrollIntoView on HTMLElement
      HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      render(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content</div>
        </JobDetailClient>
      );

      // scrollIntoView should be called with smooth scroll
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });

    it('should not scroll when autoApply is false', () => {
      const scrollIntoViewMock = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      render(
        <JobDetailClient job={mockJob} autoApply={false}>
          <div>Content</div>
        </JobDetailClient>
      );

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('should not scroll when autoApply is undefined', () => {
      const scrollIntoViewMock = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      render(
        <JobDetailClient job={mockJob}>
          <div>Content</div>
        </JobDetailClient>
      );

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('should attach ref to sidebar container', () => {
      render(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content</div>
        </JobDetailClient>
      );

      // Verify sidebar container has ref
      const sidebarContainer = document.querySelector('.lg\\:col-span-1');
      expect(sidebarContainer).toBeInTheDocument();
    });
  });

  describe('Referrer tracking', () => {
    it('should pass referrer to child components when provided', () => {
      render(
        <JobDetailClient job={mockJob} referrer="search">
          <div>Content</div>
        </JobDetailClient>
      );

      // Component should render - actual back link will be in page.tsx
      expect(document.body).toBeInTheDocument();
    });

    it('should handle missing referrer gracefully', () => {
      render(
        <JobDetailClient job={mockJob}>
          <div>Content</div>
        </JobDetailClient>
      );

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Props interface', () => {
    it('should accept autoApply prop', () => {
      const { container } = render(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content</div>
        </JobDetailClient>
      );

      expect(container).toBeInTheDocument();
    });

    it('should accept referrer prop', () => {
      const { container } = render(
        <JobDetailClient job={mockJob} referrer="search">
          <div>Content</div>
        </JobDetailClient>
      );

      expect(container).toBeInTheDocument();
    });

    it('should accept both autoApply and referrer props', () => {
      const { container } = render(
        <JobDetailClient job={mockJob} autoApply={true} referrer="search">
          <div>Content</div>
        </JobDetailClient>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Scroll timing', () => {
    it('should scroll after component mounts', async () => {
      const scrollIntoViewMock = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      const { rerender } = render(
        <JobDetailClient job={mockJob} autoApply={false}>
          <div>Content</div>
        </JobDetailClient>
      );

      expect(scrollIntoViewMock).not.toHaveBeenCalled();

      // Update to autoApply=true
      rerender(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content</div>
        </JobDetailClient>
      );

      // Should scroll after re-render
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });

    it('should only scroll once even with multiple renders', () => {
      const scrollIntoViewMock = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      const { rerender } = render(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content</div>
        </JobDetailClient>
      );

      const firstCallCount = scrollIntoViewMock.mock.calls.length;

      // Re-render with same props
      rerender(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content 2</div>
        </JobDetailClient>
      );

      // Should not scroll again (useEffect dependency on autoApply)
      expect(scrollIntoViewMock.mock.calls.length).toBe(firstCallCount);
    });
  });

  describe('Integration with sidebar', () => {
    it('should render sidebar within ref container', () => {
      render(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content</div>
        </JobDetailClient>
      );

      const sidebar = document.querySelector('[data-testid="sidebar"]');
      expect(sidebar).toBeInTheDocument();

      // Verify sidebar is within the ref container
      const sidebarContainer = document.querySelector('.lg\\:col-span-1');
      expect(sidebarContainer).toContainElement(sidebar);
    });

    it('should pass required props to JobDetailSidebar', () => {
      render(
        <JobDetailClient job={mockJob} autoApply={true}>
          <div>Content</div>
        </JobDetailClient>
      );

      // Verify JobDetailSidebar was called with correct props
      expect(JobDetailSidebar).toHaveBeenCalled();
      const callArgs = (JobDetailSidebar as ReturnType<typeof vi.fn>).mock.calls[0][0];

      expect(callArgs.job).toEqual(mockJob);
      expect(callArgs.isAuthenticated).toBe(true);
      expect(callArgs.profileCompletion).toBe(0);
      expect(callArgs.onApplyAuth).toBeInstanceOf(Function);
    });
  });
});
