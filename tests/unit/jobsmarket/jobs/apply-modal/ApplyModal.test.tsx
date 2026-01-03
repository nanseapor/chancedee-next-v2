/**
 * Unit Tests for ApplyModal Component
 *
 * Tests modal state management, submission flow, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplyModal } from '@/components/jobsmarket/jobs/ApplyModal';
import type { ApplyModalJob } from '@/types/jobsmarket/apply-modal.types';

// Mock the server action
vi.mock('@/lib/database/actions/job-applications', () => ({
  submitApplication: vi.fn(),
}));

// Mock jotai
vi.mock('jotai', () => ({
  useAtom: vi.fn(() => [{ uid: 'test-user-123' }, vi.fn()]),
  useAtomValue: vi.fn(() => ({ uid: 'test-user-123' })),
  atom: vi.fn((init) => ({ init })),
  createStore: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), sub: vi.fn() })),
}));

const mockJob: ApplyModalJob = {
  uid: 'test-job-123',
  title: 'Senior Developer',
  companyName: 'Test Company',
  companyId: 'test-company-123',
  companyLogo: '/logo.png',
  workLocationText: 'Bangkok, Thailand',
};

describe('ApplyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal States', () => {
    it('renders form state when open', () => {
      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      expect(screen.getByText('สมัครงาน')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ส่งใบสมัคร/ })).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <ApplyModal
          isOpen={false}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      expect(screen.queryByText('สมัครงาน')).not.toBeInTheDocument();
      expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument();
    });

    it('shows form content when modal is open', async () => {
      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      // Modal should render with form content
      expect(screen.getByText('สมัครงาน')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ส่งใบสมัคร/ })).toBeInTheDocument();
    });

    it('shows success state after successful submit', async () => {
      const { submitApplication } = await import('@/lib/database/actions/job-applications');
      vi.mocked(submitApplication).mockResolvedValue({ success: true });

      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error message when submit fails', async () => {
      const { submitApplication } = await import('@/lib/database/actions/job-applications');
      vi.mocked(submitApplication).mockResolvedValue({ success: false, error: 'JOB_CLOSED' });

      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/ปิดรับสมัครแล้ว/)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should show retry button
      expect(screen.getByText(/ลองอีกครั้ง/)).toBeInTheDocument();
    });

    it('calls onSuccess callback after successful submit', async () => {
      const { submitApplication } = await import('@/lib/database/actions/job-applications');
      vi.mocked(submitApplication).mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
          onSuccess={onSuccess}
        />
      );

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Wait for success callback (with 2 second delay after success)
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      }, { timeout: 4000 });
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(
        <ApplyModal
          isOpen={true}
          onClose={onClose}
          job={mockJob}
        />
      );

      // Find and click close button (X button in dialog)
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('allows retry after failed submission', async () => {
      const { submitApplication } = await import('@/lib/database/actions/job-applications');
      vi.mocked(submitApplication)
        .mockResolvedValueOnce({ success: false, error: 'NETWORK_ERROR' })
        .mockResolvedValueOnce({ success: true });

      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      // First submit (fails)
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      await waitFor(() => {
        expect(screen.getByText(/กรุณาลองใหม่/)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Click retry link
      fireEvent.click(screen.getByText(/ลองอีกครั้ง/));

      // Error should be cleared, form should be back
      await waitFor(() => {
        expect(screen.queryByText(/กรุณาลองใหม่/)).not.toBeInTheDocument();
      });

      // Submit button should be available again
      const submitButton = screen.getByRole('button', { name: /ส่งใบสมัคร/ });
      expect(submitButton).toBeInTheDocument();

      // Click submit again
      fireEvent.click(submitButton);

      // Should succeed this time
      await waitFor(() => {
        expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
