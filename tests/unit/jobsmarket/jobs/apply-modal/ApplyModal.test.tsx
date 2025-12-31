/**
 * Unit Tests for ApplyModal Component
 *
 * Tests modal state management, submission flow, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplyModal } from '@/components/jobsmarket/jobs/ApplyModal';
import type { ApplyModalJob } from '@/types/jobsmarket/apply-modal.types';

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

    it('shows submitting state during submit', async () => {
      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      // Submit button should be enabled initially
      const submitButton = screen.getByRole('button', { name: /ส่งใบสมัคร/ });
      expect(submitButton).not.toBeDisabled();

      // Click submit
      fireEvent.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/กำลังส่ง/)).toBeInTheDocument();
      });
    });

    it('shows success state after successful submit', async () => {
      // Mock Math.random to always succeed
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      render(
        <ApplyModal
          isOpen={true}
          onClose={vi.fn()}
          job={mockJob}
        />
      );

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Wait for success state (1 second delay)
      await waitFor(() => {
        expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should show demo notice
      expect(screen.getByText(/นี่เป็นโหมดสาธิต/)).toBeInTheDocument();

      mockRandom.mockRestore();
    });

    it('shows error state when submit fails', async () => {
      // Mock Math.random to always fail (need value ≤ 0.1 to make isSuccess = false)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.05);

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
        expect(screen.getByText(/การเชื่อมต่อล้มเหลว/)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should show retry text (link button)
      expect(screen.getByText(/ลองอีกครั้ง/)).toBeInTheDocument();

      mockRandom.mockRestore();
    });

    it('calls onSuccess callback after successful submit', async () => {
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);
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

      mockRandom.mockRestore();
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
      const mockRandom = vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.05) // First attempt fails (≤ 0.1)
        .mockReturnValueOnce(0.5);  // Second attempt succeeds (> 0.1)

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
        expect(screen.getByText(/การเชื่อมต่อล้มเหลว/)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Click retry link (clears error, goes back to editing state)
      fireEvent.click(screen.getByText(/ลองอีกครั้ง/));

      // Error should be cleared
      expect(screen.queryByText(/การเชื่อมต่อล้มเหลว/)).not.toBeInTheDocument();

      // Submit button should be available again
      const submitButton = screen.getByRole('button', { name: /ส่งใบสมัคร/ });
      expect(submitButton).toBeInTheDocument();

      // Click submit again
      fireEvent.click(submitButton);

      // Should succeed this time
      await waitFor(() => {
        expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
      }, { timeout: 2000 });

      mockRandom.mockRestore();
    });
  });
});
