/**
 * Integration Tests for Apply Modal
 *
 * Tests the complete form submission flow and state transitions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplyModal } from '@/components/jobsmarket/jobs/ApplyModal';
import type { ApplyModalJob } from '@/types/jobsmarket/apply-modal.types';

const mockJob: ApplyModalJob = {
  uid: 'test-job-123',
  title: 'Senior Developer',
  companyName: 'Test Company',
  companyId: 'company-123',
};

describe('Apply Modal Integration', () => {
  let mockRandom: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (mockRandom) {
      mockRandom.mockRestore();
    }
  });

  it('completes full form submission flow', async () => {
    // Mock success
    mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <ApplyModal
        isOpen={true}
        onClose={onClose}
        job={mockJob}
        onSuccess={onSuccess}
      />
    );

    // Verify form is displayed
    expect(screen.getByText('สมัครงาน')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

    // Wait for submitting state
    expect(screen.getByText(/กำลังส่ง/)).toBeInTheDocument();

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Should show demo notice
    expect(screen.getByText(/นี่เป็นโหมดสาธิต/)).toBeInTheDocument();

    // Should call onSuccess callback
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    }, { timeout: 4000 });
  });

  it('transitions through all states correctly', async () => {
    mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    render(
      <ApplyModal
        isOpen={true}
        onClose={vi.fn()}
        job={mockJob}
      />
    );

    // State 1: Editing (form visible)
    expect(screen.getByRole('button', { name: /ส่งใบสมัคร/ })).toBeInTheDocument();

    // Submit to trigger state transition
    fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

    // State 2: Submitting
    expect(screen.getByText(/กำลังส่ง/)).toBeInTheDocument();

    // State 3: Success
    await waitFor(() => {
      expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles submission failure and retry', async () => {
    mockRandom = vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.95) // First attempt fails
      .mockReturnValueOnce(0.5);  // Second attempt succeeds

    render(
      <ApplyModal
        isOpen={true}
        onClose={vi.fn()}
        job={mockJob}
      />
    );

    // First submit (fails)
    fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/การเชื่อมต่อล้มเหลว/)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Should be back in editing state with error shown
    expect(screen.getByRole('button', { name: /ลองอีกครั้ง/ })).toBeInTheDocument();

    // Retry
    fireEvent.click(screen.getByRole('button', { name: /ลองอีกครั้ง/ }));

    // Should succeed this time
    await waitFor(() => {
      expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('resets state when closed and reopened', async () => {
    mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const { rerender } = render(
      <ApplyModal
        isOpen={true}
        onClose={vi.fn()}
        job={mockJob}
      />
    );

    // Submit to reach success state
    fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

    await waitFor(() => {
      expect(screen.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Close modal
    rerender(
      <ApplyModal
        isOpen={false}
        onClose={vi.fn()}
        job={mockJob}
      />
    );

    // Reopen modal
    rerender(
      <ApplyModal
        isOpen={true}
        onClose={vi.fn()}
        job={mockJob}
      />
    );

    // Should be back to initial form state (not success state)
    expect(screen.getByRole('button', { name: /ส่งใบสมัคร/ })).toBeInTheDocument();
    expect(screen.queryByText(/ส่งใบสมัครเรียบร้อย/)).not.toBeInTheDocument();
  });

  it('preserves form data during validation errors', async () => {
    render(
      <ApplyModal
        isOpen={true}
        onClose={vi.fn()}
        job={mockJob}
      />
    );

    // Fill salary with invalid value
    const salaryInput = screen.getByLabelText(/เงินเดือนที่คาดหวัง/);
    fireEvent.change(salaryInput, { target: { value: '-1000' } });

    // Try to submit
    fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/เงินเดือนต้องมากกว่า 0/)).toBeInTheDocument();
    });

    // Salary input should still have the value (even though invalid)
    expect(salaryInput).toHaveValue(-1000);

    // Fix the value
    fireEvent.change(salaryInput, { target: { value: '30000' } });

    // Error should clear
    await waitFor(() => {
      expect(screen.queryByText(/เงินเดือนต้องมากกว่า 0/)).not.toBeInTheDocument();
    });
  });
});
